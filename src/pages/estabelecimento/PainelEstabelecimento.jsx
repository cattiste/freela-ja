// 📄 src/pages/estabelecimento/PainelEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'

// Subcomponentes
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendasContratadas from '@/components/AgendasContratadas'
import VagasEstabelecimentoCompleto from '@/components/VagasEstabelecimentoCompleto'
import AvaliacaoFreela from '@/components/AvaliacaoFreela'
import HistoricoChamadasEstabelecimento from '@/components/HistoricoChamadasEstabelecimento'
import ConfigPagamentoEstabelecimento from '@/pages/estabelecimento/ConfigPagamentoEstabelecimento'
import ChamadaInline from '@/components/ChamadaInline'

export default function PainelEstabelecimento() {
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [abaSelecionada, setAbaSelecionada] = useState('buscar')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setEstabelecimento(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', user.uid)
        const snap = await getDoc(ref)

        if (snap.exists() && snap.data().tipo === 'estabelecimento') {
          setEstabelecimento({ uid: user.uid, ...snap.data() })
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        }
      } catch (err) {
        console.error('Erro ao buscar dados:', err)
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

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'buscar':
        return <BuscarFreelas estabelecimento={estabelecimento} />
      case 'agendas':
        return (
          <div className="flex flex-col gap-6">
            <AgendasContratadas estabelecimento={estabelecimento} />
            <ChamadaInline usuario={estabelecimento} tipo="estabelecimento" />
          </div>
        )
      case 'vagas':
        return <VagasEstabelecimentoCompleto estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacaoFreela estabelecimento={estabelecimento} />
      case 'historico':
        return <HistoricoChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'configuracoes':
        return <ConfigPagamentoEstabelecimento usuario={estabelecimento} />
      default:
        return null
    }
  }

  if (carregando) {
    return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  }

  if (!estabelecimento) {
    return <div className="text-center text-red-600 mt-8">Acesso não autorizado.</div>
  }

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
      <MenuInferiorEstabelecimento onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
