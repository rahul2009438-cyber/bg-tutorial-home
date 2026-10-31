import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

// Register Service Worker with permanent white-screen shield & controllerchange auto-reload
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('[SW] Registered successfully with scope:', reg.scope);
    }).catch((err) => {
      console.warn('[SW] Registration failed:', err);
    });
  });

  // Reload client once new service worker takes control to avoid stale assets
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true;
      console.log('[SW] Controller changed. Refreshing for fresh assets...');
      window.location.reload();
    }
  });
}

// Global unhandled error/asset fetch shield to prevent blank white-screen traps
window.addEventListener('error', (e) => {
  // If a chunk load error or critical script failure occurs
  if (e?.message && (e.message.includes('Loading chunk') || e.message.includes('Failed to fetch dynam'))) {
    console.warn('[Shield] Detected chunk loading error, executing recovery purge...');
    if ('caches' in window) {
      caches.keys().then((keys) => {
        return Promise.all(keys.map(k => caches.delete(k)));
      }).then(() => {
        window.location.reload();
      });
    }
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center font-bold text-slate-700 bg-slate-50">
          লোড হচ্ছে...
        </div>
      }>
        <App />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
