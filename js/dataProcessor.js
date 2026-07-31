import { getAiCategory } from './aiProcessor.js';

let aiFailed = false;

export async function guessCategory(merchant, rawData) {
  if (aiFailed) return 'Diversos';
  
  try {
    return await getAiCategory(merchant, rawData);
  } catch (err) {
    console.error('AI Categorization failed, disabling for this session:', err);
    aiFailed = true;
    return 'Diversos';
  }
}
