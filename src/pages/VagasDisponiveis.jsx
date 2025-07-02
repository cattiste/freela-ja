import React, { useEffect, useState } from 'react'
import { collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

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
        // Busca vagas abertas ordenando por urgente e dataPublicacao ascendente
        const q = query(
          collection(db, 'vagas'),
          where('status', '==', 'aberta'),
          orderBy('urgente', 'desc'),
          orderBy('dataPublicacao', 'asc')
        )
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
        estabelecimentoUid: vaga.estabelecimentoUid,
        freelaUid: freela.uid,
        dataCandidatura: serverTimestamp(),
        status: 'pendente'
      })

      setSucesso(`Candidatura enviada para vaga: ${vaga.funcao}`)
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
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700">
          {erro}
          <button
            className="float-right font-bold"
            onClick={() => setErro(null)}
          >
            ✕
          </button>
        </div>
      )}

      {sucesso && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">
          {sucesso}
          <button
            className="float-right font-bold"
            onClick={() => setSucesso(null)}
          >
            ✕
          </button>
        </div>
      )}

      {vagas.length === 0 ? (
        <p className="text-center text-gray-600">
          Nenhuma vaga disponível no momento.
        </p>
      ) : (
        <div className="space-y-6">
          {vagas.map(vaga => (
            <div
              key={vaga.id}
              className={`p-4 border rounded-xl shadow ${
                vaga.urgente ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
            >
              <h3 className="text-xl font-semibold text-orange-700">{vaga.funcao || vaga.titulo}</h3>
              <p><strong>Empresa:</strong> {vaga.empresa || vaga.estabelecimentoNome}</p>
              <p><strong>Cidade:</strong> {vaga.cidade}</p>
              <p><strong>Tipo:</strong> {vaga.tipoVaga === 'clt' ? 'CLT (Fixa)' : vaga.tipoVaga === 'freela' ? 'Freela (Diária)' : 'Não informado'}</p>
              {vaga.tipoVaga === 'freela' && vaga.valorDiaria && (
                <p><strong>Valor da diária:</strong> R$ {vaga.valorDiaria.toFixed(2)}</p>
              )}
              {vaga.tipoVaga === 'clt' && vaga.salario && (
                <p><strong>Salário:</strong> R$ {vaga.salario.toFixed(2)}</p>
              )}
              <p><strong>Data:</strong> {vaga.dataPublicacao ? new Date(vaga.dataPublicacao.seconds * 1000).toLocaleDateString('pt-BR') : 'Não informada'}</p>
              {vaga.descricao && <p className="mt-2 text-gray-700">{vaga.descricao}</p>}
              {vaga.urgente && <p className="text-red-600 font-semibold mt-2">URGENTE</p>}

              <button
                className="btn-primary mt-4"
                onClick={() => handleCandidatar(vaga)}
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
