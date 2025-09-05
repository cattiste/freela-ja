// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext' // ✅ IMPORTANTE

const rootElement = document.getElementById('root')


if (rootElement) {
  ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
  )
} else {
  console.error('Elemento #root não encontrado no HTML.')
}

const waitEfipay = () => new Promise((res) => {
  const ok = () => (window.$gn && typeof window.$gn.getPaymentToken === 'function') || (window.EfiPay && window.EfiPay.getPaymentToken);
  if (ok()) return res();
  let tries = 0;
  const id = setInterval(() => { tries++; if (ok() || tries>50) { clearInterval(id); res(); } }, 100);
});