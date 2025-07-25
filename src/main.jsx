// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { AuthProvider } from './context/AuthContext' // ✅ IMPORTANTE

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AuthProvider> {/* ✅ Envolve tudo */}
        <App />
      </AuthProvider>
    </React.StrictMode>
  )
} else {
  console.error('Elemento #root não encontrado no HTML.')
}
