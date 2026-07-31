export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white font-bold shadow-lg z-50 transition-all ${
    type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function setLoading(isLoading, message = 'A processar...') {
  let loader = document.getElementById('globalLoader');
  if (isLoading) {
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'globalLoader';
      loader.className = 'fixed inset-0 bg-white/80 flex flex-col items-center justify-center z-50';
      loader.innerHTML = `
        <div class="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p id="loaderMessage" class="text-indigo-700 font-bold">${message}</p>
      `;
      document.body.appendChild(loader);
    } else {
      const msgEl = document.getElementById('loaderMessage');
      if (msgEl) msgEl.textContent = message;
    }
  } else if (loader) {
    loader.remove();
  }
}
