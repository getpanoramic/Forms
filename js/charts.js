let chartCat, chartTime;

export function initCharts(data) {
  console.log('DEBUG: initCharts called.');
  const ChartInstance = window.Chart;
  
  if (!ChartInstance) {
      console.error('DEBUG: Chart.js not loaded on window.');
      return;
  }

  try {
    // Prepare Category Data
    const categoryTotals = {};
    const timelineData = {};
    
    data.forEach(t => {
      // Use unified mapping: 'csvCategory' (CSV) or 'category' (Supabase)
      const cat = t.csvCategory || t.category || 'Diversos';
      const amount = parseFloat(t.amountEur || t.amount) || 0;
      
      categoryTotals[cat] = (categoryTotals[cat] || 0) + Math.abs(amount);
      
      const date = t.date;
      timelineData[date] = (timelineData[date] || 0) + Math.abs(amount);
    });

    // Render Category Chart
    const canvasCat = document.getElementById('chartCategory');
    if (canvasCat) {
        if (chartCat) chartCat.destroy();
        chartCat = new ChartInstance(canvasCat.getContext('2d'), {
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
    }

    // Render Timeline Chart
    const canvasTime = document.getElementById('chartTime');
    if (canvasTime) {
        if (chartTime) chartTime.destroy();
        const sortedDates = Object.keys(timelineData).sort();
        chartTime = new ChartInstance(canvasTime.getContext('2d'), {
        type: 'line',
        data: {
            labels: sortedDates,
            datasets: [{
            label: 'Gastos por Dia (EUR)',
            data: sortedDates.map(d => timelineData[d]),
            borderColor: 'rgba(16, 185, 129, 1)',
            tension: 0.1
            }]
        },
        options: { responsive: true }
        });
    }
    console.log('DEBUG: Charts rendered.');
  } catch (err) {
    console.error('DEBUG: Failed to initialize charts:', err);
  }
}
