import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Silently handle benign dev-only Vite websocket HMR reconnect logs
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (
      event.reason &&
      (typeof event.reason === 'string' || event.reason.message) &&
      (String(event.reason).includes('WebSocket') ||
        String(event.reason.message || '').includes('WebSocket') ||
        String(event.reason.message || '').includes('vite'))
    ) {
      event.preventDefault();
    }
  });
}

// Register Service Worker for PWA & Native Android WebAPK Installation
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .catch((err) => {
        console.warn('[PWA] Service Worker registration:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary fallbackTitle="Apni Sawari App Recovery">
      <App />
    </ErrorBoundary>
  </StrictMode>,
);


