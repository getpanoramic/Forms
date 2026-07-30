import { getAiCategory } from './aiProcessor.js';

export async function guessCategory(merchant) {
  try {
    return await getAiCategory(merchant);
  } catch (err) {
    console.error('AI Categorization failed, falling back to default:', err);
    return 'Diversos';
  }
}
