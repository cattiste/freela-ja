// PainelEstabelecimento.jsx com useUsuariosOnline e lastSeen visível

import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, updateDoc, serverTimestamp,
  collection, query, where, onSnapshot
} from 'firebase/firestore'
import { auth, db } from '@/firebase'

import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import VagasEstabelecimentoCompleto from '@/components/VagasEstabelecimentoCompleto'
import AvaliacaoFreela from '@/components/AvaliacaoFreela'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'
import ConfigPagamentoEstabelecimento from '@/pages/estabelecimento/ConfigPagamentoEstabelecimento'
import ChamadasEstabelecimento from '@/pages/estabelecimento/ChamadasEstabelecimento'
import ChamadasAtivas from '@/pages/estabelecimento/ChamadasAtivas'
import { useUsuariosOnline } from '@/hooks/useUsuariosOnline'
import TesteUsuariosOnline from '@/components/TesteUsuariosOnline'

export default function PainelEstabelecimento() {
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [abaSelecionada, setAbaSelecionada] = useState('buscar')
  const [chamadaAtiva, setChamadaAtiva] = useState(null)

  const usuariosOnline = useUsuariosOnline()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setEstabelecimento(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)

        if (snap.exists() && snap.data().tipo === 'estabelecimento') {
          const dados = snap.data()
          setEstabelecimento({ uid: usuario.uid, ...dados })
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
            new Audio('/sons/checkout.mp3').play().catch(() => {})
            alert(`⚠️ O freela ${data.freelaNome} finalizou o serviço. Confirme o checkout.`)
          }
        })
      }
    )

    return () => unsub()
  }, [estabelecimento])

  useEffect(() => {
    if (!estabelecimento?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', estabelecimento.uid),
      where('status', 'in', ['pendente', 'aceita', 'checkin_freela', 'checkout_freela'])
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setChamadaAtiva(docs[0] || null)
    })

    return () => unsubscribe()
  }, [estabelecimento])

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

  const renderChamadaAtiva = () => (
    chamadaAtiva ? (
      <div className="mb-4">
        <ChamadaInline chamada={chamadaAtiva} tipo="estabelecimento" usuario={estabelecimento} />
      </div>
    ) : null
  )

  const renderConteudo = () => {
<<<<<<< HEAD
    
=======
    <TesteUsuariosOnline />
>>>>>>> 5aa624513c9196e042eb877b62e9e58986b7d2f1
    switch (abaSelecionada) {
      case 'buscar':
        return <BuscarFreelas estabelecimento={estabelecimento} usuariosOnline={usuariosOnline} />
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

  if (carregando) return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  if (!estabelecimento) return <div className="text-center text-red-600 mt-8">Acesso não autorizado.</div>

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
      {!['buscar', 'ativas', 'historico'].includes(abaSelecionada) && renderChamadaAtiva()}
      {renderConteudo()}
      <MenuInferiorEstabelecimento onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
      <TesteUsuariosOnline />
    </div>
  )
}