import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'

// Subcomponentes do painel
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
    <div className="p-4 pb-20">
      {renderConteudo()}
      <MenuInferiorEstabelecimento onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
