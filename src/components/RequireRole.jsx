// src/components/RequireRole.jsx
import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

// ✅ Normaliza tipos para só freela / contratante / admin
const normalizeTipo = (t) => {
  if (!t) return ''
  const norm = String(t).trim().toLowerCase().replace(/\s+/g, '_')
  if (['freela', 'freelancer'].includes(norm)) return 'freela'
  if (['contratante', 'pessoa_fisica', 'estabelecimento', 'cliente', 'empresa'].includes(norm)) {
    return 'contratante'
  }
  if (norm === 'admin') return 'admin'
  return '' // se não reconhecido, trata como inválido
}

const defaultPainelDe = {
  freela: '/painelfreela',
  contratante: '/painelcontratante',
  admin: '/painel-admin',
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

  // ✅ admin sempre tem acesso a tudo
  if (tipoNorm === 'admin') {
    return <>{children}</>
  }

  // ⚠️ Se não tiver tipo definido ainda, bloqueia até carregar
  if (!tipoNorm) {
    return <Navigate to="/acesso-negado" replace />
  }

  // 🚫 Se o tipo não está permitido
  if (allowNorm.length > 0 && !allowNorm.includes(tipoNorm)) {
    const destino = painelDe[tipoNorm] || '/acesso-negado'
    return <Navigate to={destino} replace />
  }

  return <>{children}</>
}
