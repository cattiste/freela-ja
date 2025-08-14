// src/pages/contratante/PainelContratante.jsx
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

import MenuInferiorContratante from '@/components/MenuInferiorContratante'
import PerfilContratante from './PerfilContratante'
import BuscarFreelas from '@/components/BuscarFreelas'
import ChamadasContratante from './ChamadasContratante'
import HistoricoContratante from './HistoricoContratante'
import ConfiguracoesContratante from './ConfiguracoesContratante'

export default function PainelContratante() {
  const { usuario, carregando } = useAuth()
  const [aba, setAba] = useState('perfil')

  if (carregando || !usuario) return <div className="p-4">Carregando...</div>
  if (usuario.tipo !== 'contratante') return <div className="p-4">Acesso negado.</div>

  const renderAba = () => {
    switch (aba) {
      case 'perfil': return <PerfilContratante />
      case 'buscar': return <BuscarFreelas tipoContratante="contratante" />
      case 'chamadas': return <ChamadasContratante />
      case 'historico': return <HistoricoContratante />
      case 'config': return <ConfiguracoesContratante />
      default: return <PerfilContratante />
    }
  }

  return (
    <div className="pb-20">
      {renderAba()}
      <MenuInferiorContratante aba={aba} setAba={setAba} />
    </div>
  )
}
