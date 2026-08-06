// Trading212 PDF Parser
// Expected structure:
// Typically lines with Date, Time, Instrument, Action, Details, Amount, Currency

export async function parseT212Pdf(file, onProgress) {
    if (onProgress) onProgress('A processar T212 PDF...');
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
    const pdf = await loadingTask.promise;
    let lines = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Group items by their vertical position
        const items = content.items;
        const lineGroups = {};
        
        items.forEach(item => {
            const y = Math.round(item.transform[5]);
            if (!lineGroups[y]) lineGroups[y] = [];
            lineGroups[y].push(item);
        });
        
        const sortedY = Object.keys(lineGroups).sort((a, b) => b - a);
        sortedY.forEach(y => {
            const rowItems = lineGroups[y].sort((a, b) => a.transform[4] - b.transform[4]);
            const lineText = rowItems.map(item => item.str).join(' ');
            if (lineText.trim()) lines.push(lineText);
        });
    }

    const rows = [];
    
    // T212 Logic: Look for lines that look like transactions
    // Assuming format based on Trading212 Activity statement
    // Date | Time | Instrument | Action | Details | Amount | Currency
    // 2026-07-01 | 09:00 | AAPL | Buy | ... | 100.00 | EUR
    
    // Simple regex to detect likely date start
    const dateRegex = /^\d{4}-\d{2}-\d{2}/;

    lines.forEach(line => {
        if (dateRegex.test(line)) {
            const parts = line.split(/\s{2,}/); // Split by multiple spaces
            if (parts.length >= 5) {
                rows.push({
                    date: parts[0],
                    merchant: parts[2] + ' ' + parts[4], // Instrument + Details
                    amount: parseFloat(parts[5].replace(',', '.')),
                    source: 't212'
                });
            }
        }
    });
    
    console.log('T212 Parsed rows:', rows);
    
    if (onProgress) onProgress(`Sucesso! ${rows.length} transações encontradas.`);
    return rows;
}
