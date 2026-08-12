const fs = require('fs');
const pdf = require('pdf-parse/lib/pdf-parse.js');

let dataBuffer = fs.readFileSync('383_7_2026.pdf');

pdf(dataBuffer).then(function(data) {
    console.log(data.text);
}).catch(function(error){
    console.error(error);
});
