// Mock browser environment
global.window = {};
global.window['pdfjs-dist/build/pdf'] = require('pdfjs-dist');

const { parsePdf } = require('./js/pdfParser.js');
const fs = require('fs');

async function testParser() {
    const filePath = 'junho 2026.pdf';
    const buffer = fs.readFileSync(filePath);
    
    console.log('Parsing PDF...');
    const rows = await parsePdf({ arrayBuffer: () => buffer }, console.log);
    
    console.log(`Found ${rows.length} transactions.`);
    console.log(JSON.stringify(rows, null, 2));
}

testParser().catch(console.error);
