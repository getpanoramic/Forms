// Use the global pdfjsLib provided by CDN in index.html
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export async function parsePdf(file) {
    const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
    const pdf = await loadingTask.promise;
    let text = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map(item => item.str).join(' ');
    }
    
    // Parser Logic for Moey/CA format
    // Matches: DD-MM-YYYY / DD-MM-YYYY DESCRIPTION AMOUNT (+/-)
    const rows = [];
    const regex = /(\d{2}-\d{2}-\d{4})\s*\/\s*\d{2}-\d{2}-\d{4}\s+(.+?)\s+(-?\d+,\d{2})\s*([+-]?)/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
        const [_, dateStr, merchant, amountStr, sign] = match;
        const amount = parseFloat(amountStr.replace(',', '.')) * (sign === '-' ? -1 : 1);
        
        rows.push({
            date: dateStr.split('-').reverse().join('-'), // Convert DD-MM-YYYY to YYYY-MM-DD
            merchant: merchant.trim(),
            amount: amount,
            category: 'Diversos',
            submitted: false,
            source: 'pdf'
        });
    }
    return rows;
}
