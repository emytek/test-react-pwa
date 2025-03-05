export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/serviceworker.js')
          .then((reg) => console.log('Service Worker registered: ', reg.scope))
          .catch((err) => console.error('Service Worker registration failed: ', err));
      });
    }
  }

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload(); // Auto-refresh when a new SW is installed
  });
  
  