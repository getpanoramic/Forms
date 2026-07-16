export async function getExchangeRate() {
  const CACHE_KEY = 'exchangeRate';
  const CACHE_TIME = 1000 * 60 * 60 * 24; // 24 hours

  const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
  if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
    return cached.rate;
  }

  try {
    // Using a free API for demonstration purposes. 
    // In production, consider a more robust setup.
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    const rate = data.rates.EUR; // Simplified assumption
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rate, timestamp: Date.now() }));
    return rate;
  } catch (err) {
    console.error('Failed to fetch rate, using default', err);
    return 1.17; // Fallback
  }
}
