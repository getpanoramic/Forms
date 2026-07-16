import { CATEGORIES } from './config.js';

const RULES = [
  { keywords: ['uber', 'bolt', 'cp ', 'metropolitano'], category: 'Passes mensais' },
  { keywords: ['lidl', 'continente', 'pingo doce', 'auchan'], category: 'Groceries' },
  { keywords: ['netflix', 'spotify', 'apple.com', 'disney'], category: 'Subscrições' },
  { keywords: ['cafe', 'starbucks', 'padaria'], category: 'Cafés/Lanches', csvCat: 'Eating Out' },
  { keywords: ['amazon', 'zara', 'h&m'], category: 'Shopping', csvCat: 'Shopping' },
  { keywords: ['airbn', 'booking'], category: 'Viagens', csvCat: 'Travel' },
  { keywords: ['farmacia'], category: 'Saúde', csvCat: 'Health' }
];

export function guessCategory(row) {
  const m = row.merchant.toLowerCase();
  const c = row.csvCategory || '';

  for (const rule of RULES) {
    if (rule.keywords.some(kw => m.includes(kw))) return rule.category;
  }
  
  if (c === 'Transport') return 'Passes mensais';
  if (c === 'Groceries') return 'Groceries';
  if (c === 'Eating Out') return 'Jantares';
  if (c === 'Shopping') return 'Shopping';
  if (c === 'Travel') return 'Viagens';
  if (c === 'Health') return 'Saúde';
  if (c === 'Finance') return 'Finanças';
  if (c === 'Entertainment') return 'Entretenimento';

  return 'Diversos';
}
