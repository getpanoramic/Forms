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
