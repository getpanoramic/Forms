import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0';
import { CATEGORIES } from './config.js';

// Configure environment to fetch models remotely
env.allowLocalModels = false;

let classifier = null;
const candidateLabels = Object.keys(CATEGORIES);

export async function getAiCategory(merchant) {
    if (!classifier) {
        // Load the model once
        classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
    }
    
    const output = await classifier(merchant, candidateLabels, { multi_label: false });
    return output.labels[0]; // Return the top predicted category
}
