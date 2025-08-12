// src/components/RequireRole.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const normalizeTipo = (t) => {
  if (!t) return ''
  let s = String(t).trim().toLowerCase().replace(/\s+/g, '_')
  if (s === 'pessoafisica') s = 'pessoa_fisica'
  return s
}

const defaultPainelDe = {
  freela: '/painelfreela',
  estabelecimento: '/painelestabelecimento',
  pessoa_fisica: '/pf', // rota final
  admin: '/admin',
}

export default function RequireRole({ allow = [], children, routeMap }) {
  const ctx = (typeof useAuth === 'function' ? useAuth() : null) || {}
  const usuario = ctx.usuario ?? null
  const carregando = ctx.carregando ?? false

  const painelDe = { ...defaultPainelDe, ...(routeMap || {}) }

  if (carregando) {
    return <div className="p-8 text-center text-orange-600">Carregando…</div>
  }

  if (!usuario?.uid) {
    return <Navigate to="/login" replace />
  }

  if (usuario?.uid && (usuario?.tipo === undefined || usuario?.tipo === null)) {
    return <div className="p-8 text-center text-orange-600">Carregando perfil…</div>
  }

  const tipoNorm = normalizeTipo(usuario?.tipo)
  const allowNorm = allow.map(normalizeTipo)

  if (tipoNorm === 'admin') {
    return <>{children}</>
  }

  if (allowNorm.length > 0 && !allowNorm.includes(tipoNorm)) {
    const destino = painelDe[tipoNorm] || '/'
    return <Navigate to={destino} replace />
  }

  return <>{children}</>
}
