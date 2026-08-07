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

    console.log('T212 Lines extracted:', lines.length);
    console.log('DEBUG: Sample lines:', lines.slice(0, 20));

    const rows = [];
    // Improved T212 Regex:
    // Matches lines starting with YYYY-MM-DD
    // Trading212 often has spaces inside the numbers or different formats.
    // Example: 2026-07-01 15:30:00 AAPL Buy 1.000 100.00 EUR
    const lineRegex = /^(\d{4}-\d{2}-\d{2})\s+\d{2}:\d{2}:\d{2}\s+(.+?)\s+(Buy|Sell|Dividend)\s+.*?\s+(-?[\d\.]+)\s+([A-Z]{3})/;

    lines.forEach(line => {
        const match = line.match(lineRegex);
        if (match) {
            console.log('DEBUG: Matched line:', line);
            rows.push({
                date: match[1],
                merchant: `${match[2]} (${match[3]})`,
                amount: parseFloat(match[4]),
                source: 't212'
            });
        } else {
             // Log why it didn't match
             if (line.match(/^\d{4}-\d{2}-\d{2}/)) {
                console.log('DEBUG: Date line did not match full regex:', line);
             }
        }
    });
    
    console.log('T212 Parsed rows:', rows);
    
    if (onProgress) onProgress(`Sucesso! ${rows.length} transações encontradas.`);
    return rows;
}
