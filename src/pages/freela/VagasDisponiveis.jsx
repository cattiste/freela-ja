// src/pages/freela/VagasDisponiveis.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function VagasDisponiveis({ freela }) {
  const [vagas, setVagas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [candidaturas, setCandidaturas] = useState([])

  useEffect(() => {
    if (!freela?.uid) return
    async function fetchVagas() {
      setLoading(true)
      setErro(null)
      try {
        const q = query(
          collection(db, 'vagas'),
          where('status', '==', 'aberta'),
          where('tipo', '==', 'clt')
        )
        const snap = await getDocs(q)
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        console.log('[VagasDisponiveis] fetched CLT vagas:', list)
        setVagas(list)

        const qCand = query(
          collection(db, 'candidaturas'),
          where('freelaUid', '==', freela.uid)
        )
        const snapCand = await getDocs(qCand)
        setCandidaturas(snapCand.docs.map(c => ({ id: c.id, ...c.data() })))
      } catch (err) {
        console.error('[VagasDisponiveis] erro:', err)
        setErro('Erro ao carregar vagas CLT.')
      } finally {
        setLoading(false)
      }
    }
    fetchVagas()
  }, [freela.uid])

  if (loading) return <p className="text-center text-orange-600">Carregando vagas CLT...</p>
  if (erro) return <p className="text-center text-red-600">{erro}</p>
  if (vagas.length === 0) return <p className="text-center text-gray-600">Nenhuma vaga CLT disponível.</p>

  return (
    <div className="space-y-6">
      {vagas.map(vaga => (
        <div key={vaga.id} className="p-4 border rounded shadow-sm">
          <h3 className="font-bold text-orange-700 mb-1">{vaga.titulo}</h3>
          <p><strong>Cidade:</strong> {vaga.cidade}</p>
          <p><strong>Descrição:</strong> {vaga.descricao}</p>
          <button
            onClick={async () => {
              await addDoc(collection(db, 'candidaturas'), {
                vagaId: vaga.id,
                estabelecimentoUid: vaga.estabelecimentoUid,
                freelaUid: freela.uid,
                dataCandidatura: serverTimestamp(),
                status: 'pendente'
              })
            }}
            className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >Candidatar-se</button>
        </div>
      ))}
    </div>
  )
}
