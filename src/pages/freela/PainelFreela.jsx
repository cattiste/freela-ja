import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
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
      console.log('[Auth] Usuário autenticado:', user)

      if (!user) {
        console.warn('[Auth] Nenhum usuário logado.')
        setFreela(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists()) {
          const dados = snap.data()
          console.log('[Firestore] Dados do usuário:', dados)

          if (dados.tipo === 'freela') {
            setFreela({ uid: user.uid, ...dados })
            await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
            console.log('[Firestore] Freela carregado e atualizado.')
          } else {
            console.warn('[Auth] Esse usuário não é um freela.')
          }
        } else {
          console.warn('[Firestore] Documento do usuário não encontrado.')
        }
      } catch (err) {
        console.error('[Erro] Falha ao buscar dados do usuário:', err)
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
        return (
          <div className="grid md:grid-cols-3 gap-4 mt-4">
            <PerfilFreela freela={freela} />
            <AgendaFreela freela={freela} />
            <AvaliacoesRecebidasFreela freelaUid={freela.uid} />
          </div>
        )
      case 'agenda':
        return <AgendaFreela freela={freela} />
      case 'chamadas':
        return <ChamadasFreela freela={freela} />
      case 'avaliacoes':
        return <AvaliacoesRecebidasFreela freelaUid={freela.uid} />
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
