// Trading212 PDF Parser
// Structured for: Trading 212 Activity Statements
// Format: Date | Time | Instrument | Action | Details | Amount | Currency

export async function parseT212Pdf(file, onProgress) {
    if (onProgress) onProgress('A processar T212 PDF...');
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    const loadingTask = pdfjsLib.getDocument(await file.arrayBuffer());
    const pdf = await loadingTask.promise;
    let lines = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Items are usually structured with a transform matrix.
        // We need to group them by Y-coordinate to form lines.
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

    console.log('T212 Lines extracted:', lines.length);
    // console.log('DEBUG: Sample lines:', lines.slice(0, 50));

    const rows = [];
    
    // Trading212 statements have a specific date format: YYYY-MM-DD
    // Example transaction line structure:
    // 2026-07-01 15:30:00 Instrument Action Details Amount Currency
    const lineRegex = /^(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\s+(.+?)\s+(Buy|Sell|Dividend)\s+(.+?)\s+(-?[\d\.]+)\s+([A-Z]{3})/;

    lines.forEach(line => {
        const match = line.match(lineRegex);
        if (match) {
            rows.push({
                date: match[1],
                merchant: `${match[2]} (${match[3]})`,
                amount: parseFloat(match[5].replace(',', '.')),
                source: 't212'
            });
        }
    });
    
    console.log('T212 Parsed rows:', rows);
    
    if (onProgress) onProgress(`Sucesso! ${rows.length} transações encontradas.`);
    return rows;
}
