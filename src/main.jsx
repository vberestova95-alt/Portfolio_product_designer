import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import { AppErrorBoundary } from './components/AppErrorBoundary.jsx';
import { LanguageProvider } from './i18n/LanguageContext.jsx';
import { enableReveal } from './lib/reveal.js';
import './styles/global.css';

enableReveal();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </LanguageProvider>
  </React.StrictMode>,
);
