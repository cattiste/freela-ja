// src/components/RequireRole.jsx
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export default function RequireRole({ allow = [], children }) {
  // evita crash se o hook não estiver disponível por algum motivo
  const ctx = (typeof useAuth === 'function' ? useAuth() : null) || {}
  const usuario = ctx.usuario ?? null
  const carregando = ctx.carregando ?? false// src/components/RequireRole.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// normaliza valores do tipo vindos do Firestore
const normalizeTipo = (t) => {
  if (!t) return ''
  let s = String(t).trim().toLowerCase().replace(/\s+/g, '_')
  if (s === 'pessoafisica') s = 'pessoa_fisica'
  return s
}

// mapeamento padrão SEM hífen
const defaultPainelDe = {
  freela: '/painelfreela',
  estabelecimento: '/painelestabelecimento',
  pessoa_fisica: '/painelpessoafisica',
  admin: '/admin', // ajuste se tiver painel de admin próprio
}

export default function RequireRole({ allow = [], children, routeMap }) {
  const ctx = (typeof useAuth === 'function' ? useAuth() : null) || {}
  const usuario = ctx.usuario ?? null
  const carregando = ctx.carregando ?? false

  const painelDe = { ...defaultPainelDe, ...(routeMap || {}) }

  if (carregando) {
    return <div className="p-8 text-center text-orange-600">Carregando…</div>
  }

  // não logado → login
  if (!usuario?.uid) {
    return <Navigate to="/login" replace />
  }

  // perfil carregando mas ainda sem tipo
  if (usuario?.uid && (usuario?.tipo === undefined || usuario?.tipo === null)) {
    return <div className="p-8 text-center text-orange-600">Carregando perfil…</div>
  }

  const tipoNorm = normalizeTipo(usuario?.tipo)
  const allowNorm = allow.map(normalizeTipo)

  // admin sempre passa
  if (tipoNorm === 'admin') {
    return <>{children}</>
  }

  // restrito e tipo não liberado → manda para o painel correspondente SEM hífen
  if (allowNorm.length > 0 && !allowNorm.includes(tipoNorm)) {
    const destino = painelDe[tipoNorm] || '/'
    return <Navigate to={destino} replace />
  }

  return <>{children}</>
}


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
