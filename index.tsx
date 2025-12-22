
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App'; /* CORREGIDO: Importación por defecto */
import { AppProvider } from './contexts/AppContext';
import './index.css'; /* CRÍTICO: Carga Tailwind */

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(err => {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontró el elemento root');

createRoot(rootElement).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
