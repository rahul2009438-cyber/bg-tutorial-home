import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

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
