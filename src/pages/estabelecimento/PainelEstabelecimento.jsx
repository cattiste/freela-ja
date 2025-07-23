import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, updateDoc, serverTimestamp,
  collection, query, where, onSnapshot
} from 'firebase/firestore'
import { auth, db } from '@/firebase'

// Componentes
import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import VagasEstabelecimentoCompleto from '@/components/VagasEstabelecimentoCompleto'
import AvaliacaoFreela from '@/components/AvaliacaoFreela'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'
import ConfigPagamentoEstabelecimento from '@/pages/estabelecimento/ConfigPagamentoEstabelecimento'
import ChamadasEstabelecimento from '@/pages/estabelecimento/ChamadasEstabelecimento'
import ChamadaInline from '@/components/ChamadaInline'
import ChamadasAtivas from '@/pages/estabelecimento/ChamadasAtivas'


export default function PainelEstabelecimento() {
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [abaSelecionada, setAbaSelecionada] = useState('buscar')
  const [chamadaAtiva, setChamadaAtiva] = useState(null)

  // Autenticação e carregamento de dados do estabelecimento
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('[Auth] onAuthStateChanged:', user)

      if (!user) {
        console.warn('[Auth] Usuário não autenticado')
        setEstabelecimento(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists() && snap.data().tipo === 'estabelecimento') {
          const dados = snap.data()
          console.log('[Auth] Estabelecimento identificado:', dados)
          setEstabelecimento({ uid: user.uid, ...dados })
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        } else {
          console.warn('[Auth] Documento não encontrado ou não é um estabelecimento')
        }
      } catch (err) {
        console.error('[Auth] Erro ao buscar dados do estabelecimento:', err)
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  // Alerta sonoro e visual para checkout pendente
  useEffect(() => {
    if (!estabelecimento?.uid) return

    const unsub = onSnapshot(
      query(
        collection(db, 'chamadas'),
        where('estabelecimentoUid', '==', estabelecimento.uid),
        where('status', '==', 'checkout_freela'),
        where('checkOutEstabelecimento', '==', false)
      ),
      (snap) => {
        snap.docChanges().forEach(({ doc: d, type }) => {
          if (type === 'added') {
            const data = d.data()
            console.warn('[Checkout] Freela finalizou. Confirmação pendente:', data)
            new Audio('/sons/checkout.mp3').play().catch(() => {})
            alert(`⚠️ O freela ${data.freelaNome} finalizou o serviço. Confirme o checkout.`)
          }
        })
      }
    )

    return () => unsub()
  }, [estabelecimento])

  // Verificação contínua de chamadas ativas
  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'checkout_freela'])
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      console.log('[Chamada Ativa] Chamadas detectadas:', docs)
      setChamadaAtiva(docs[0] || null)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  // Topo com dados do estabelecimento
  const renderTopo = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow p-4 flex items-center gap-4 mb-4 sticky top-0 z-40">
      {estabelecimento?.foto && (
        <img
          src={estabelecimento.foto}
          alt="Logo"
          className="w-16 h-16 rounded-full border border-orange-300 object-cover"
        />
      )}
      <div>
        <h2 className="text-xl font-bold text-orange-700">{estabelecimento?.nome}</h2>
        <p className="text-sm text-gray-600">{estabelecimento?.endereco}</p>
        <p className="text-sm text-gray-600">📞 {estabelecimento?.celular}</p>
      </div>
    </div>
  )

  // Chamada ativa, se houver
  const renderChamadaAtiva = () => (
    chamadaAtiva ? (
      <div className="mb-4">
        <ChamadaInline chamada={chamadaAtiva} tipo="estabelecimento" usuario={estabelecimento} />
      </div>
    ) : null
  )

  // Conteúdo da aba selecionada
  const renderConteudo = () => {
    console.log('[Render] Aba selecionada:', abaSelecionada)

    switch (abaSelecionada) {
      case 'buscar':
        return <BuscarFreelas estabelecimento={estabelecimento} />
      case 'agendas':
        return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'vagas':
        return <VagasEstabelecimentoCompleto estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacaoFreela estabelecimento={estabelecimento} />
      case 'historico':
        return <HistoricoChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'configuracoes':
        return <ConfigPagamentoEstabelecimento usuario={estabelecimento} />
      case 'ativas':
        return <ChamadasAtivas estabelecimento={estabelecimento} />      
      case 'chamadas':
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      default:
        return null
    }
  }

  // Renderização final
  if (carregando) {
    console.log('[Render] Estado: carregando...')
    return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  }

  if (!estabelecimento) {
    console.error('[Render] Estabelecimento nulo. Acesso negado.')
    return <div className="text-center text-red-600 mt-8">Acesso não autorizado.</div>
  }

  console.log('[Render] Painel carregado com sucesso')

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
      {abaSelecionada === 'buscar' && (
        <div className="banner-container">
          <img src="/imgs/banner-chefja.png" alt="Banner ChefJá" className="banner-img" />
        </div>
      )}
      {renderTopo()}
      {abaSelecionada !== 'buscar' && renderChamadaAtiva()}
      {renderConteudo()}
      <MenuInferiorEstabelecimento onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
