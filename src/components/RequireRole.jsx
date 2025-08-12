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
  pessoa_fisica: '/pf', // tua rota PF
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

  // admin sempre passa
  if (tipoNorm === 'admin') {
    return <>{children}</>
  }

  // 🔧 Hotfix: se o tipo ainda não veio do perfil, não bloqueia.
  // Isso evita cair na Home quando o doc ainda não tem "tipo" (ou está vazio).
  if (!tipoNorm) {
    return <>{children}</>
  }

  if (allowNorm.length > 0 && !allowNorm.includes(tipoNorm)) {
    const destino = painelDe[tipoNorm] || '/'
    return <Navigate to={destino} replace />
  }

  return <>{children}</>
}
