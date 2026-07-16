import Chart from 'https://cdn.jsdelivr.net/npm/chart.js/auto/auto.min.js';

let chart;

export function initChart(data) {
  try {
    const canvas = document.getElementById('chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Prepare data (category totals)
    const categoryTotals = {};
    data.forEach(t => {
      if (t.amountEur < 0) {
        const cat = t.csvCategory || 'Diversos';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(t.amountEur);
      }
    });

    if (chart) chart.destroy();
    chart = new Chart(ctx, {
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
  } catch (err) {
    console.error('Failed to initialize chart:', err);
  }
}
