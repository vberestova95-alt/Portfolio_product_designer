import React from 'react';
import ReactDOM from 'react-dom/client';
import { StatsApp } from './StatsApp.jsx';
import './stats.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <StatsApp />
  </React.StrictMode>,
);
