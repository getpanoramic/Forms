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

    const rows = [];
    
    // Trading212 statements have a specific date format: YYYY-MM-DD
    // Pattern 1: Executed Trades
    // Line Example: 2026-07-01 13:30:00   WM   US94106L1098   53508642386   Buy   0.00647776   $225   $1.4575   Market   OTC   Regular hours   1.13866875   -   -   -   €1.28
    // Regex needs to skip a variable number of columns to get the final EUR value at the end.
    const tradeRegex = /^\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(.+?)\s+.+?\s+(Buy|Sell|Dividend|Deposit|Withdrawal)\s+.+?€([\d\.,]+)$/;

    // Pattern 2: Transactions & Dividends
    // Format Example: 2026-07-01 01:02:33 Interest on cash €0.04
    const transRegex = /\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(.+?)\s+([€$£][\d\.,-]+)/;

    lines.forEach(line => {
        // Log all lines for debugging
        // console.log('DEBUG: Line structure:', line);

        const tradeMatch = line.match(tradeRegex);
        const transMatch = line.match(transRegex);

        if (tradeMatch) {
            console.log('DEBUG: Matched trade line:', line);
            // tradeMatch: 1=date, 2=time, 3=instrument, 4=action, 5=EUR amount
            rows.push({
                date: tradeMatch[1],
                merchant: `${tradeMatch[3]} (${tradeMatch[4]})`, // Instrument + Action
                amount: parseFloat(tradeMatch[5].replace(',', '.')),
                source: 't212'
            });
        } else if (transMatch) {
            console.log('DEBUG: Matched transaction line:', line);
            // Amount might contain currency symbol, need to strip it
            const amountStr = transMatch[4].replace(/[€$£]/, '').replace(',', '.');
            rows.push({
                date: transMatch[1],
                merchant: transMatch[3].trim(),
                amount: parseFloat(amountStr),
                source: 't212'
            });
        }
    });
    
    console.log('T212 Parsed rows:', rows);
    
    if (onProgress) onProgress(`Sucesso! ${rows.length} transações encontradas.`);
    return rows;
}
