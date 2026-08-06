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

    // Extract relevant data using regex or structural search
    // Based on the provided example:
    // "RECIBO DE REMUNERAÇÕES - JULHO DE 2026 (01/07/2026 a 31/07/2026)"
    // "Total a Receber * 1685,31 13700,70"

    let dateMatch = lines.join(' ').match(/RECIBO DE REMUNERAÇÕES - .* DE (\d{4}) \(.*\)/);
    let totalMatch = lines.join(' ').match(/Total a Receber \*\s*([\d\s,]+)\s*([\d\s,]+)/);
    
    // Construct the date and amount
    const year = dateMatch ? dateMatch[1] : new Date().getFullYear();
    const amount = totalMatch ? parseFloat(totalMatch[1].replace(/\s/g, '').replace(',', '.')) : 0;
    
    const rows = [{
        date: `${year}-07-31`, // Placeholder, needs month extraction
        merchant: 'Vencimento',
        amount: amount,
        source: 'salary'
    }];
    
    if (onProgress) onProgress(`Sucesso!`);
    return rows;
}
