// src/components/RequireRole.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireRole({ allow = [], children }) {
  // evita crash se o hook não estiver disponível por algum motivo
  const ctx = (typeof useAuth === 'function' ? useAuth() : null) || {}
  const usuario = ctx.usuario ?? null
  const carregando = ctx.carregando ?? false

  if (carregando) {
    return <div className="p-8 text-center text-orange-600">Carregando…</div>
  }

  // não logado → login
  if (!usuario?.uid) {
    return <Navigate to="/login" replace />
  }

  // admin sempre passa
  if (usuario?.tipo === 'admin') {
    return <>{children}</>
  }

  // checa papel permitido (compat com 'pessoa_fisica'/'pessoaFisica')
  const tipoNorm =
    usuario?.tipo === 'pessoaFisica' ? 'pessoa_fisica' : (usuario?.tipo || '').toLowerCase()

  if (allow.length > 0 && !allow.map(s => s.toLowerCase()).includes(tipoNorm)) {
    // bloqueado → manda pra home (ou uma página 403 se preferir)
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
