import { getAiCategory } from './aiProcessor.js';

export async function guessCategory(merchant, rawData) {
  try {
    return await getAiCategory(merchant, rawData);
  } catch (err) {
    console.error('AI Categorization failed, falling back to default:', err);
    return 'Diversos';
  }
}
