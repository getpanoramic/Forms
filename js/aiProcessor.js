import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.16.0';
import { CATEGORIES } from './config.js';

env.allowLocalModels = false;

// Track initialization state
let initializationPromise = null;
let classifier = null;
const candidateLabels = Object.keys(CATEGORIES);

async function initializeModel() {
    if (initializationPromise) return initializationPromise;
    
    initializationPromise = (async () => {
        try {
            console.log('DEBUG: Initializing AI Model...');
            classifier = await pipeline('zero-shot-classification', 'Xenova/distilbert-base-uncased-mnli');
            console.log('DEBUG: AI Model initialized successfully.');
        } catch (err) {
            console.error('DEBUG: Failed to initialize AI Model:', err);
            initializationPromise = null; // Allow retry
            throw err;
        }
    })();
    return initializationPromise;
}

export async function getAiCategory(merchant, rawData) {
    await initializeModel();
    
    if (!classifier) throw new Error('Classifier not initialized');
    
    // Simplest prompt to minimize memory usage
    const prompt = merchant;
    
    // Set a timeout to prevent hanging
    const output = await classifier(prompt, candidateLabels, { multi_label: false });
    return output.labels[0]; // Return the top predicted category
}
