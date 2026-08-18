// Salary Slip Parser (Recibos de Vencimento)
// Structured for: Engexpor Salary Slips
// Format: Date, Total Liquid, etc.

export async function parseSalaryPdf(file, onProgress) {
    if (onProgress) onProgress('A processar Recibo...');
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
    const pdf = await loadingTask.promise;
    let lines = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Group items by their vertical position (y coordinate) to reconstruct lines accurately
        const items = content.items;
        const lineGroups = {};
        
        items.forEach(item => {
            const y = Math.round(item.transform[5]); // Vertical coordinate
            if (!lineGroups[y]) lineGroups[y] = [];
            lineGroups[y].push(item);
        });
        
        // Sort lines vertically (top to bottom) and sort items horizontally (left to right)
        const sortedY = Object.keys(lineGroups).sort((a, b) => b - a);
        sortedY.forEach(y => {
            const rowItems = lineGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
            const lineText = rowItems.map(item => item.str).join(' ');
            if (lineText.trim()) lines.push(lineText);
        });
    }

    const fullText = lines.join('\n');
    console.log('DEBUG: Full PDF text content for analysis (with lines):', fullText);

    // Helper to extract values - specifically the first number after label
    const parseNumber = (str) => {
        if (!str) return 0;
        // Clean up: Replace spaces with nothing (thousands separator)
        // Replace comma with dot (decimal separator)
        // Handle "1 995,50" -> 1995.50
        const cleaned = str.trim().replace(/\s/g, '').replace(',', '.');
        return parseFloat(cleaned);
    };

    const extractValueAfterKeyword = (text, keyword) => {
        const index = text.indexOf(keyword);
        if (index === -1) return 0;
        const afterKeyword = text.substring(index + keyword.length);
        const match = afterKeyword.match(/\s*([\d\s]+,\d+)/);
        return match ? parseNumber(match[1]) : 0;
    };

    // Regex patterns updated to be more robust
    const dateMatch = fullText.match(/RECIBO DE REMUNERAÇÕES - .* DE (\d{4})/);
    
    const year = dateMatch ? dateMatch[1] : new Date().getFullYear();
    
    // Extract values
    const gross = extractValueAfterKeyword(fullText, 'Total Ilíquido');
    const irs = extractValueAfterKeyword(fullText, 'Desc. IRS Colaborador');
    const ss = extractValueAfterKeyword(fullText, 'Desc. SS Colaborador');
    const net = extractValueAfterKeyword(fullText, 'Total a Receber *');
    
    console.log(`DEBUG: Extracted Salary Data: Gross=${gross}, IRS=${irs}, SS=${ss}, Net=${net}`);

    const parseLineItems = (text, startKeyword, endKeyword) => {
        const lines = text.split('\n');
        const items = [];
        let inSection = false;
        
        for (let line of lines) {
            if (line.includes(startKeyword)) {
                inSection = true;
                continue;
            }
            if (line.includes(endKeyword)) {
                inSection = false;
                break;
            }
            
            if (inSection && line.trim()) {
                // Heuristic: Last two or three components are usually numeric
                const parts = line.split(/\s{2,}/).filter(p => p.trim());
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    const value = parseNumber(parts[parts.length - 1]);
                    items.push({ name, value });
                }
            }
        }
        return items;
    };

    const parsePagamentos = (text) => {
        // Look for the "Tipo Transf." header, allowing for some flexibility in whitespace
        const startMarker = "Tipo Transf.";
        const endMarker = "Mês Acumulado";
        const startIndex = text.indexOf(startMarker);
        if (startIndex === -1) return [];
        const endIndex = text.indexOf(endMarker, startIndex + startMarker.length);
        if (endIndex === -1) return [];
        
        const section = text.substring(startIndex + startMarker.length, endIndex);
        const lines = section.split('\n');
        const items = [];
        
        for (let line of lines) {
            if (!line.trim()) continue;
            // Check for known keywords within the payment section
            if (line.toLowerCase().includes('vale de refeição') || line.toLowerCase().includes('remuneração')) {
                // Pattern: Name ... Amount ...
                const parts = line.split(/\s{2,}/).filter(p => p.trim());
                if (parts.length >= 2) {
                    const name = parts[0].trim();
                    // Try to find the amount among the parts
                    const amountPart = parts.find(p => /[\d\s]+,\d+/.test(p));
                    if (amountPart) {
                        items.push({ name, value: parseNumber(amountPart) });
                    }
                }
            }
        }
        return items;
    };

    // Extract line items into specific variables
    const getVal = (items, name) => {
        const item = items.find(i => i.name.toLowerCase().includes(name.toLowerCase()));
        return item ? item.value : 0;
    };

    const remuneracoes = parseLineItems(fullText, 'Remunerações', 'Desconto');
    const descontos = parseLineItems(fullText, 'Desconto', 'Total Ilíquido');
    const pagamentos = parsePagamentos(fullText);
    
    console.log(`DEBUG: Extracted Line Items: Remunerações=${remuneracoes.length}, Descontos=${descontos.length}, Pagamentos=${pagamentos.length}`);

    const rows = [{
        date: `${year}-07-31`, // Simplified for now
        merchant: 'Vencimento',
        amount: net,
        gross: gross,
        irs: getVal(descontos, 'IRS'),
        ss: getVal(descontos, 'Segurança Social'),
        vencimento_base: getVal(remuneracoes, 'Vencimento Base'),
        cartao_vale_refeicao: getVal(remuneracoes, 'Cartão/Vale Refeição'),
        isencao_horario: getVal(remuneracoes, 'Isenção de Horário'),
        seguro_saude: getVal(remuneracoes, 'Seguro de Saude'),
        pagamento_vale_refeicao: getVal(pagamentos, 'Vale de Refeição'),
        source: 'salary'
    }];
    
    if (onProgress) onProgress(`Sucesso!`);
    return rows;
}
