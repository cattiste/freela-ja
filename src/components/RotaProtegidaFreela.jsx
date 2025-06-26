import React from 'react'
import { Navigate } from 'react-router-dom'

export default function RotaProtegidaFreela({ children }) {
  const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))

  if (!usuario || usuario.tipo !== 'freela') {
    return <Navigate to="/login" />
  }

  return children
}
