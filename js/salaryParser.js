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
        content.items.forEach(item => lines.push(item.str));
    }

    const fullText = lines.join(' ');
    console.log('DEBUG: Full PDF text content for analysis:', fullText);

    // Helper to extract values - specifically the first number after label
    const parseNumber = (str) => {
        if (!str) return 0;
        // Clean up: Replace spaces with nothing (thousands separator)
        // Replace comma with dot (decimal separator)
        // Handle "1 995,50" -> 1995.50
        const cleaned = str.trim().replace(/\s/g, '').replace(',', '.');
        return parseFloat(cleaned);
    };

    // Regex patterns updated to be more robust
    const dateMatch = fullText.match(/RECIBO DE REMUNERAÇÕES - .* DE (\d{4})/);
    
    // Look for "Total Ilíquido" specifically followed by the value that precedes "Total Descontos"
    const grossMatch = fullText.match(/Total Ilíquido\s+([\d\s]+,\d+)\s+Total Descontos/);
    
    // Specifically target the IRS and SS discounts
    const irsMatch = fullText.match(/Desc\. IRS Colaborador\s+([\d\s]+,\d+)/);
    const ssMatch = fullText.match(/Desc\. SS Colaborador\s+([\d\s]+,\d+)/);
    
    // Specifically target the "Total a Receber" near the end
    const netMatch = fullText.match(/Total a Receber\s+\*\s+([\d\s]+,\d+)\s+\d+\d+,\d+/);

    const year = dateMatch ? dateMatch[1] : new Date().getFullYear();
    
    // Extract values
    const gross = grossMatch ? parseNumber(grossMatch[1]) : 0;
    const irs = irsMatch ? parseNumber(irsMatch[1]) : 0;
    const ss = ssMatch ? parseNumber(ssMatch[1]) : 0;
    const net = netMatch ? parseNumber(netMatch[1]) : 0;
    
    console.log(`DEBUG: Extracted Salary Data: Gross=${gross}, IRS=${irs}, SS=${ss}, Net=${net}`);

    const rows = [{
        date: `${year}-07-31`, // Simplified for now
        merchant: 'Vencimento',
        amount: net,
        gross: gross,
        irs: irs,
        ss: ss,
        source: 'salary'
    }];
    
    if (onProgress) onProgress(`Sucesso!`);
    return rows;
}
