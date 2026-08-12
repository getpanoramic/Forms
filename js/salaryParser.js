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

    // Helper to extract values
    const extract = (regex) => {
        const match = fullText.match(regex);
        return match ? parseFloat(match[1].replace(/\s/g, '').replace(',', '.')) : 0;
    };

    // Regex patterns based on extracted text
    const dateMatch = fullText.match(/RECIBO DE REMUNERAÇÕES - .* DE (\d{4})/);
    const grossMatch = fullText.match(/Total Ilíquido\s+([\d\s,]+)/);
    const irsMatch = fullText.match(/IRS\s+\d+,\d+%\s+[\d\s,]+\s+([\d\s,]+)/);
    const ssMatch = fullText.match(/Segurança Social\s+\d+,\d+%\s+[\d\s,]+\s+([\d\s,]+)/);
    const netMatch = fullText.match(/Total a Receber\s+([\d\s,]+)/);

    const year = dateMatch ? dateMatch[1] : new Date().getFullYear();
    
    // Extract values
    const gross = grossMatch ? parseFloat(grossMatch[1].replace(/\s/g, '').replace(',', '.')) : 0;
    const irs = irsMatch ? parseFloat(irsMatch[1].replace(/\s/g, '').replace(',', '.')) : 0;
    const ss = ssMatch ? parseFloat(ssMatch[1].replace(/\s/g, '').replace(',', '.')) : 0;
    const net = netMatch ? parseFloat(netMatch[1].replace(/\s/g, '').replace(',', '.')) : 0;
    
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
