import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx';
import { ConsentBanner } from './components/ConsentBanner.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import { applyConsent } from './lib/consent.js';
import { enableReveal } from './lib/reveal.js';
import './styles/global.css';

enableReveal();
applyConsent();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
      <ConsentBanner />
    </LanguageProvider>
  </React.StrictMode>,
);
