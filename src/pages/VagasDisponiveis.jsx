import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/firebase'

function formatarData(timestamp) {
  if (!timestamp) return 'Não informado'
  // Firestore Timestamp tem .seconds
  if (timestamp.seconds) {
    const data = new Date(timestamp.seconds * 1000)
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }
  // Caso já seja Date ou string
  return new Date(timestamp).toLocaleDateString('pt-BR')
}

export default function VagasDisponiveis({ freela }) {
  const [vagas, setVagas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  useEffect(() => {
    async function carregarVagas() {
      setLoading(true)
      setErro(null)
      try {
        // Pega vagas com status 'aberta'
        const q = query(collection(db, 'vagas'), where('status', '==', 'aberta'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista)
      } catch (err) {
        console.error('Erro ao carregar vagas:', err)
        setErro('Erro ao carregar vagas. Tente novamente.')
      }
      setLoading(false)
    }
    carregarVagas()
  }, [])

  async function handleCandidatar(vaga) {
    if (!freela?.uid) {
      setErro('Você precisa estar logado para se candidatar.')
      return
    }

    setErro(null)
    setSucesso(null)

    try {
      await addDoc(collection(db, 'candidaturas'), {
        vagaId: vaga.id,
        estabelecimentoUid: vaga.estabelecimentoUid || null,
        freelaUid: freela.uid,
        dataCandidatura: serverTimestamp(),
        status: 'pendente',
      })

      setSucesso(`Candidatura enviada para vaga: ${vaga.titulo || vaga.funcao || ''}`)
    } catch (err) {
      console.error('Erro ao candidatar:', err)
      setErro('Erro ao enviar candidatura. Tente novamente.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando vagas disponíveis...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">🎯 Vagas Disponíveis</h2>

      {erro && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 relative">
          {erro}
          <button
            onClick={() => setErro(null)}
            className="absolute top-1 right-2 font-bold hover:text-red-900"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      {sucesso && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700 relative">
          {sucesso}
          <button
            onClick={() => setSucesso(null)}
            className="absolute top-1 right-2 font-bold hover:text-green-900"
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>
      )}

      {vagas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma vaga disponível no momento.</p>
      ) : (
        <div className="space-y-6">
          {vagas.map(vaga => (
            <div
              key={vaga.id}
              className={`p-5 border rounded-xl shadow ${
                vaga.urgente ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <h3 className="text-xl font-semibold text-orange-700 mb-2">
                {vaga.titulo || vaga.funcao || 'Sem título'}
              </h3>

              <p>
                <strong>Tipo:</strong>{' '}
                {vaga.tipoVaga?.toLowerCase() === 'clt' ? 'CLT (Fixa)' : 'Freela (Diária)'}
              </p>

              {vaga.tipoVaga?.toLowerCase() === 'freela' && vaga.valorDiaria != null && (
                <p>
                  <strong>Valor da diária:</strong> R$ {Number(vaga.valorDiaria).toFixed(2).replace('.', ',')}
                </p>
              )}

              {vaga.tipoVaga?.toLowerCase() === 'clt' && vaga.salario != null && (
                <p>
                  <strong>Salário:</strong> R$ {Number(vaga.salario).toFixed(2).replace('.', ',')}
                </p>
              )}

              <p>
                <strong>Data da publicação:</strong> {formatarData(vaga.dataPublicacao)}
              </p>

              {vaga.descricao && (
                <p className="mt-2 text-gray-700">
                  <strong>Descrição:</strong> {vaga.descricao}
                </p>
              )}

              {vaga.urgente && (
                <p className="text-red-600 font-semibold mt-3 uppercase tracking-wide">URGENTE</p>
              )}

              <button
                onClick={() => handleCandidatar(vaga)}
                className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition"
              >
                Candidatar-se
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
