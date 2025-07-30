import React, { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'

import MenuInferiorEstabelecimento from '@/components/MenuInferiorEstabelecimento'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import RecebimentosEstabelecimento from './RecebimentosEstabelecimento'
import ConfiguracoesEstabelecimento from './ConfiguracoesEstabelecimento'
import CardAvaliacaoFreela from '@/components/CardAvaliacaoFreela'

export default function PainelEstabelecimento() {
  const { usuario, carregando } = useAuth()
  const [aba, setAba] = useState('chamadas')
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!carregando && (!usuario || usuario.tipo !== 'estabelecimento')) {
      navigate('/')
    }
  }, [usuario, carregando, navigate])

  useEffect(() => {
    if (!usuario?.uid) return

    const buscarChamadasNaoAvaliadas = async () => {
      const q = query(
        collection(db, 'chamadas'),
        where('estabelecimentoUid', '==', usuario.uid),
        where('status', '==', 'finalizada')
      )

      const snap = await getDocs(q)
      const chamadasFinalizadas = []

      for (let docSnap of snap.docs) {
        const chamada = { id: docSnap.id, ...docSnap.data() }

        // Verifica se já existe avaliação
        const avaliacoesQ = query(
          collection(db, 'avaliacoes'),
          where('tipo', '==', 'freela'),
          where('chamadaId', '==', chamada.id)
        )
        const avaliacoesSnap = await getDocs(avaliacoesQ)

        if (avaliacoesSnap.empty) {
          // Buscar dados do freela
          const freelaSnap = await getDocs(
            query(collection(db, 'usuarios'), where('uid', '==', chamada.freelaUid))
          )
          if (!freelaSnap.empty) {
            const freela = freelaSnap.docs[0].data()
            chamada.freela = { ...freela, uid: chamada.freelaUid }
            chamadasFinalizadas.push(chamada)
          }
        }
      }

      setAvaliacoesPendentes(chamadasFinalizadas)
    }

    buscarChamadasNaoAvaliadas()
  }, [usuario])

  if (carregando || !usuario) return <p className="p-4">Carregando...</p>

  return (
    <div className="pb-20">
      <div className="flex justify-around py-4 border-b">
        <button onClick={() => setAba('chamadas')} className={aba === 'chamadas' ? 'font-bold text-orange-600' : ''}>
          Chamadas
        </button>
        <button onClick={() => setAba('recebimentos')} className={aba === 'recebimentos' ? 'font-bold text-orange-600' : ''}>
          Recebimentos
        </button>
        <button onClick={() => setAba('avaliar')} className={aba === 'avaliar' ? 'font-bold text-orange-600' : ''}>
          Avaliar
        </button>
        <button onClick={() => setAba('config')} className={aba === 'config' ? 'font-bold text-orange-600' : ''}>
          Configurações
        </button>
      </div>

      {aba === 'chamadas' && <ChamadasEstabelecimento />}
      {aba === 'recebimentos' && <RecebimentosEstabelecimento />}
      {aba === 'config' && <ConfiguracoesEstabelecimento />}

      {aba === 'avaliar' && (
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Avaliar Freelancers</h2>

          {avaliacoesPendentes.length === 0 ? (
            <p className="text-gray-500">Nenhum freela para avaliar no momento.</p>
          ) : (
            avaliacoesPendentes.map((chamada) => (
              <CardAvaliacaoFreela
                key={chamada.id}
                chamada={chamada}
                onAvaliado={(id) =>
                  setAvaliacoesPendentes((prev) => prev.filter((c) => c.id !== id))
                }
              />
            ))
          )}
        </div>
      )}

      <MenuInferiorEstabelecimento abaAtual={aba} setAba={setAba} />
    </div>
  )
}
