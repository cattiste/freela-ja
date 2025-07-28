// src/pages/freela/PainelFreela.jsx

import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, updateDoc, serverTimestamp
} from 'firebase/firestore'
import { auth, db } from '@/firebase'

// Componentes
import MenuInferiorFreela from '@/components/MenuInferiorFreela'
import PerfilFreela from '@/pages/freela/PerfilFreela'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'
import ChamadasFreela from '@/pages/freela/ChamadasFreela'
import EventosDisponiveis from '@/pages/freela/EventosDisponiveis'
import VagasDisponiveis from '@/pages/freela/VagasDisponiveis'

export default function PainelFreela() {
  const [freela, setFreela] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFreela(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists() && snap.data().tipo === 'freela') {
          const dados = snap.data()
          setFreela({ uid: user.uid, ...dados })
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        } else {
          console.warn('[Auth] Documento não encontrado ou não é um freela')
        }
      } catch (err) {
        console.error('[Auth] Erro ao buscar dados do freela:', err)
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const renderTopo = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow p-4 flex items-center gap-4 mb-4 sticky top-0 z-40">
      {freela?.foto && (
        <img
          src={freela.foto}
          alt="Freela"
          className="w-16 h-16 rounded-full border border-orange-300 object-cover"
        />
      )}
      <div>
        <h2 className="text-xl font-bold text-orange-700">{freela?.nome}</h2>
        <p className="text-sm text-gray-600">{freela?.especialidade}</p>
        <p className="text-sm text-gray-600">📞 {freela?.celular}</p>
      </div>
    </div>
  )

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return <PerfilFreela freela={freela} />
      case 'agenda':
        return <AgendaFreela freela={freela} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freela={freela} />
      case 'chamadas':
        return <ChamadasFreela freela={freela} />
      case 'eventos':
        return <EventosDisponiveis freela={freela} />
      case 'vagas':
        return <VagasDisponiveis freela={freela} />
      default:
        return null
    }
  }

  if (carregando) return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  if (!freela) return <div className="text-center text-red-600 mt-8">Acesso não autorizado.</div>

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 pb-20"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {renderTopo()}
      {renderConteudo()}
      <MenuInferiorFreela onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
