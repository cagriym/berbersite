import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Tailwind CSS veya diğer global stilleriniz
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Bu satırı ekleyin

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* App bileşenini BrowserRouter ile sarın */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);