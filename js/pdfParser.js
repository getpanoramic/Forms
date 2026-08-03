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
    let currentTransaction = null;

    const startRegex = /^(\d{2}-\d{2}-\d{4})\s*\/\s*\d{2}-\d{2}-\d{4}\s+(.+)/;
    const amountRegex = /(\d+,\d{2})\s*([+-])\s*(\d+,\d{2})$/;

    lines.forEach(line => {
        const cleanLine = line.trim();
        const startMatch = cleanLine.match(startRegex);
        
        if (startMatch) {
            if (currentTransaction) rows.push(currentTransaction);
            currentTransaction = {
                dateStr: startMatch[1],
                merchant: startMatch[2],
            };
            
            // Check if amount is in the same line
            const amountMatch = cleanLine.match(amountRegex);
            if (amountMatch) {
                currentTransaction.merchant = currentTransaction.merchant.replace(amountMatch[0], '').trim();
                currentTransaction.amountStr = amountMatch[1];
                currentTransaction.sign = amountMatch[2];
                rows.push(currentTransaction);
                currentTransaction = null;
            }
            return;
        }
        
        if (currentTransaction) {
            const amountMatch = cleanLine.match(amountRegex);
            if (amountMatch) {
                currentTransaction.merchant = (currentTransaction.merchant + ' ' + cleanLine.replace(amountMatch[0], '')).trim();
                currentTransaction.amountStr = amountMatch[1];
                currentTransaction.sign = amountMatch[2];
                rows.push(currentTransaction);
                currentTransaction = null;
            } else {
                currentTransaction.merchant += ' ' + cleanLine;
            }
        }
    });

    // Map to final format
    const finalRows = rows.map(r => {
        const amount = parseFloat(r.amountStr.replace(',', '.')) * (r.sign === '-' ? -1 : 1);
        return {
            date: r.dateStr.split('-').reverse().join('-'), // YYYY-MM-DD
            merchant: r.merchant.trim(),
            amount: amount,
            category: 'Diversos',
            submitted: false,
            source: 'pdf'
        };
    });
    
    if (onProgress) onProgress(`Sucesso! ${finalRows.length} transações encontradas.`);
    return finalRows;
}
