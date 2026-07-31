// Use the global pdfjsLib provided by CDN in index.html
const pdfjsLib = window['pdfjs-dist/build/pdf'];
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export async function parsePdf(file, onProgress) {
    if (onProgress) onProgress('A carregar PDF...');
    const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
    const pdf = await loadingTask.promise;
    let lines = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
        if (onProgress) onProgress(`A extrair texto da página ${i}/${pdf.numPages}...`);
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
    
    if (onProgress) onProgress('A analisar transações...');
    const rows = [];
    
    // Moey / CA Statement line pattern: 
    // "01-06-2026 / 01-06-2026 Description 180,00 + 325,49"
    // Regex matches the start date, the separator, the second date, then grabs the description, amount, sign (+/-) and balance
    const lineRegex = /^(\d{2}-\d{2}-\d{4})\s*\/\s*\d{2}-\d{2}-\d{4}\s+(.+?)\s+(\d+,\d{2})\s*([+-])\s*(\d+,\d{2})/;
    
    lines.forEach((line, index) => {
        const cleanLine = line.trim();
        const match = cleanLine.match(lineRegex);
        if (match) {
            const [_, dateStr, merchant, amountStr, sign, balance] = match;
            const amount = parseFloat(amountStr.replace(',', '.')) * (sign === '-' ? -1 : 1);
            
            rows.push({
                date: dateStr.split('-').reverse().join('-'), // YYYY-MM-DD
                merchant: merchant.trim(),
                amount: amount,
                category: 'Diversos',
                submitted: false,
                source: 'pdf'
            });
        }
    });
    
    if (onProgress) onProgress(`Sucesso! ${rows.length} transações encontradas.`);
    return rows;
}
