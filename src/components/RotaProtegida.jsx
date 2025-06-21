// src/components/RotaProtegida.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'

export default function RotaProtegida({ children }) {
  const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))

  if (!usuarioLogado || usuarioLogado.tipo !== 'estabelecimento') {
    return <Navigate to="/login" />
  }

  return children
}
