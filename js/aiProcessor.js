import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0';
import { CATEGORIES } from './config.js';

env.allowLocalModels = false;

let classifier = null;
const candidateLabels = Object.keys(CATEGORIES);

export async function getAiCategory(merchant, rawData) {
    if (!classifier) {
        // Load the model once
        classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
    }
    
    // Simplest prompt to minimize memory usage
    const prompt = merchant;
    
    // Set a timeout or handle potential hang if possible
    const output = await classifier(prompt, candidateLabels, { multi_label: false });
    return output.labels[0]; // Return the top predicted category
}
