// src/components/RequireRole.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const normalizeTipo = (t) => {
  if (!t) return ''
  return String(t).trim().toLowerCase().replace(/\s+/g, '_')
}

const defaultPainelDe = {
  freela: '/painelfreela',
  estabelecimento: '/painelestabelecimento',
  contratante: '/painelcontratante',
  admin: '/admin',
}

export default function RequireRole({ allow = [], children, routeMap }) {
  const { usuario, carregando } = useAuth() || { usuario: null, carregando: false }
  const painelDe = { ...defaultPainelDe, ...(routeMap || {}) }

  if (carregando) {
    return <div className="p-8 text-center text-orange-600">Carregando…</div>
  }

  if (!usuario?.uid) {
    return <Navigate to="/login" replace />
  }

  const tipoNorm = normalizeTipo(usuario?.tipo)
  const allowNorm = allow.map(normalizeTipo)

  // admin sempre tem acesso a tudo
  if (tipoNorm === 'admin') {
    return <>{children}</>
  }

  // ⚠️ Se o tipo ainda não veio do Firestore, permite acesso temporariamente
  if (!tipoNorm) {
    return <>{children}</>
  }

  if (allowNorm.length > 0 && !allowNorm.includes(tipoNorm)) {
    const destino = painelDe[tipoNorm] || '/'
    return <Navigate to={destino} replace />
  }

  return <>{children}</>
}
