import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0';
import { CATEGORIES } from './config.js';

env.allowLocalModels = false;

let classifier = null;
const candidateLabels = Object.keys(CATEGORIES);

// Helper to get recent examples to "teach" the AI
function getTrainingExamples(data) {
    // Take the last 20 labeled transactions to provide context
    return data
        .filter(t => t.category && t.category !== 'Diversos')
        .slice(-20)
        .map(t => `${t.merchant}: ${t.category}`)
        .join('\n');
}

export async function getAiCategory(merchant, rawData) {
    if (!classifier) {
        // Load the model once
        classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
    }
    
    // Provide examples in the prompt to "teach" the AI
    const examples = getTrainingExamples(rawData);
    const prompt = examples ? 
        `Classify this transaction: "${merchant}". Based on these examples:\n${examples}` :
        `Classify this transaction: "${merchant}"`;
    
    const output = await classifier(prompt, candidateLabels, { multi_label: false });
    return output.labels[0]; // Return the top predicted category
}
