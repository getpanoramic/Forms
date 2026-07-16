// Using the UMD bundle which includes all dependencies to avoid resolution errors
import 'https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.js';

let chart;

export function initChart(data) {
  console.log('DEBUG: initChart called.');
  // Access Chart from the global scope (since it's a UMD bundle)
  const ChartInstance = window.Chart;
  
  if (!ChartInstance) {
      console.error('DEBUG: Chart.js not loaded on window.');
      return;
  }

  try {
    const canvas = document.getElementById('chart');
    if (!canvas) {
        console.error('DEBUG: Chart canvas element not found.');
        return;
    }
    const ctx = canvas.getContext('2d');
    
    // Prepare data (category totals)
    const categoryTotals = {};
    console.log('DEBUG: Processing data for chart, first 5 rows:', data.slice(0, 5));
    data.forEach(t => {
      // Allow positive amounts if they should be tracked, or check if amountEur is always positive.
      // If all values are positive, we should plot everything.
      const cat = t.csvCategory || 'Diversos';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amountEur);
    });

    console.log('DEBUG: Chart data prepared:', categoryTotals);

    if (chart) chart.destroy();
    chart = new ChartInstance(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(categoryTotals),
        datasets: [{
          label: 'Despesas por Categoria',
          data: Object.values(categoryTotals),
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
        }]
      },
      options: { responsive: true }
    });
    console.log('DEBUG: Chart rendered.');
  } catch (err) {
    console.error('DEBUG: Failed to initialize chart:', err);
  }
}
