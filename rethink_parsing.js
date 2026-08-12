const section = " Vencimento Base 1 350,00 1 350,00 Cartão/Vale Refeição 22 DIA(S) 14,00 308,00 Isenção de Horário de Trabalho 337,50 337,50 Seguro de Saude 14,25 14,25 ";

// This is still very hard to parse just by a simple split.
// The PDF structure likely has newlines or spatial coordinates in the original PDF,
// but our 'fullText' joined by ' ' has lost that.

// Maybe I should look back at how I extracted 'lines' in salaryParser.js initially.
// It iterates page, getTextContent, and pushes item.str.
// item.str contains the text.
// The issue is I joined them all into one flat string.

// To support line items, I should probably keep the line structure!
