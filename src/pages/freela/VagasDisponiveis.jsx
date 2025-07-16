// src/pages/freela/VagasDisponiveis.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function VagasDisponiveis({ freela }) {
  const [vagas, setVagas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    if (!freela?.uid) return

    async function fetchVagasCLT() {
      setLoading(true)
      setErro(null)
      try {
        // Busca só vagas CLT
        const q = query(
          collection(db, 'vagas'),
          where('status', '==', 'aberta'),
          where('tipo', '==', 'clt')
        )
        const snap = await getDocs(q)
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        setVagas(list)
      } catch (err) {
        console.error('[VagasDisponiveis]', err)
        setErro('Erro ao carregar vagas CLT.')
      } finally {
        setLoading(false)
      }
    }

    fetchVagasCLT()
  }, [freela.uid])

  if (loading) return <p className="text-center text-orange-600">Carregando vagas CLT...</p>
  if (erro)    return <p className="text-center text-red-600">{erro}</p>
  if (vagas.length === 0)
    return <p className="text-center text-gray-600">Nenhuma vaga CLT disponível.</p>

  return (
    
    <div className="max-w-4xl mx-auto p-6 mt-6 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-orange-600">
           Vagas Disponiveis
        </h2>
      </div>
    
    <div className="space-y-6">
      {vagas.map(vaga => (
        <div key={vaga.id} className="p-4 border rounded shadow-sm bg-white">
          <h3 className="font-bold text-orange-700 mb-1">{vaga.titulo}</h3>
          <p><strong>Cidade:</strong> {vaga.cidade}</p>
          <p className="mt-2 text-sm">{vaga.descricao}</p>
          <button
            onClick={async () => {
              try {
                await addDoc(collection(db, 'candidaturas'), {
                  vagaId: vaga.id,
                  estabelecimentoUid: vaga.estabelecimentoUid,
                  freelaUid: freela.uid,
                  dataCandidatura: serverTimestamp(),
                  status: 'pendente'
                })
                toast.success('Candidatura enviada!')
              } catch (e) {
                console.error(e)
                toast.error('Falha ao candidatar.')
              }
            }}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Candidatar‐se
          </button>
        </div>
      ))}
    </div>
  )
}
