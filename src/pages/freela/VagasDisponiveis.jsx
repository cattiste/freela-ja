// src/pages/freela/VagasDisponiveis.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

function formatarData(timestamp) {
  if (!timestamp) return 'Não informado'
  if (timestamp.seconds) {
    const data = new Date(timestamp.seconds * 1000)
    return data.toLocaleDateString('pt-BR')
  }
  return new Date(timestamp).toLocaleDateString('pt-BR')
}

export default function VagasDisponiveis({ freela }) {
  const { usuario } = useAuth()
  const uid = freela?.uid || usuario?.uid
  const [vagas, setVagas] = useState([])
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)
  const [candidaturas, setCandidaturas] = useState([])
  const [vagasExcluidas, setVagasExcluidas] = useState(new Set())

  if (!uid) {
    return (
      <div className="text-center text-red-600 mt-10">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </div>
    )
  }

  useEffect(() => {
    const carregarVagas = async () => {
      setLoading(true)
      setErro(null)
      try {
        const q = query(collection(db, 'vagas'), where('status', '==', 'aberta'))
        const snapshot = await getDocs(q)
        const listaVagas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(listaVagas)

        const qCand = query(collection(db, 'candidaturas'), where('freelaUid', '==', uid))
        const snapshotCand = await getDocs(qCand)
        const listaCandidaturas = snapshotCand.docs.map(doc => ({
          id: doc.id,
          vagaId: doc.data().vagaId,
          status: doc.data().status || 'pendente',
          mensagem: doc.data().mensagem || '',
          contato: doc.data().contato || '',
        }))
        setCandidaturas(listaCandidaturas)
      } catch (err) {
        console.error('Erro ao carregar vagas:', err)
        setErro('Erro ao carregar vagas. Tente novamente.')
      }
      setLoading(false)
    }

    carregarVagas()
  }, [uid])

  const handleCandidatar = async (vaga) => {
    try {
      await addDoc(collection(db, 'candidaturas'), {
        vagaId: vaga.id,
        contratanteUid: vaga.contratanteUid || null,
        freelaUid: uid,
        dataCandidatura: serverTimestamp(),
        status: 'pendente',
        mensagem: '',
        contato: '',
      })

      setSucesso(`Candidatura enviada para vaga: ${vaga.titulo || vaga.funcao || ''}`)
      setCandidaturas(prev => [...prev, {
        vagaId: vaga.id,
        status: 'pendente',
        mensagem: '',
        contato: '',
      }])
    } catch (err) {
      console.error('Erro ao candidatar:', err)
      setErro('Erro ao enviar candidatura. Tente novamente.')
    }
  }

  const handleExcluirCandidatura = async (id, vagaId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta candidatura?')) return
    try {
      await deleteDoc(doc(db, 'candidaturas', id))
      setCandidaturas(prev => prev.filter(c => c.id !== id))
      setVagasExcluidas(prev => new Set(prev).add(vagaId))
      setSucesso('Candidatura excluída com sucesso!')
    } catch (err) {
      console.error('Erro ao excluir candidatura:', err)
      setErro('Erro ao excluir candidatura. Tente novamente.')
    }
  }

  const getCandidaturaDaVaga = (vagaId) => candidaturas.find(c => c.vagaId === vagaId)

  if (loading) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        🔄 Carregando vagas disponíveis...
      </div>
    )
  }

  return (
    <div className="max-w-full p-4 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">🎯 Vagas Disponíveis</h2>

      {erro && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{erro}</div>
      )}
      {sucesso && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">{sucesso}</div>
      )}

      {vagas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma vaga disponível no momento.</p>
      ) : (
        <div className="space-y-6">
          {vagas.map(vaga => {
            const candidatura = getCandidaturaDaVaga(vaga.id)
            const isUrgente = vaga.urgente
            const isExcluida = vagasExcluidas.has(vaga.id)

            return (
              <div key={vaga.id} className={`p-5 border rounded-xl shadow ${isUrgente ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
                <h3 className="text-xl font-semibold text-orange-700 mb-2">
                  {vaga.titulo || vaga.funcao || 'Sem título'}
                </h3>

                <p><strong>Tipo:</strong> {vaga.tipoVaga?.toLowerCase() === 'clt' ? 'CLT (Fixa)' : 'Freela (Diária)'}</p>
                {vaga.tipoVaga?.toLowerCase() === 'freela' && vaga.valorDiaria && (
                  <p><strong>Valor da diária:</strong> R$ {vaga.valorDiaria.toFixed(2).replace('.', ',')}</p>
                )}
                {vaga.tipoVaga?.toLowerCase() === 'clt' && vaga.salario && (
                  <p><strong>Salário:</strong> R$ {vaga.salario.toFixed(2).replace('.', ',')}</p>
                )}
                <p><strong>Data de publicação:</strong> {formatarData(vaga.dataPublicacao)}</p>
                {vaga.descricao && <p className="mt-2 text-gray-700"><strong>Descrição:</strong> {vaga.descricao}</p>}
                {vaga.urgente && <p className="text-red-600 font-semibold mt-3 uppercase tracking-wide">URGENTE</p>}

                {candidatura ? (
                  <>
                    <p className="mt-4 font-semibold">
                      Status da candidatura:{' '}
                      <span className={`px-2 py-1 rounded ${
                        candidatura.status.toLowerCase() === 'aprovado'
                          ? 'bg-green-100 text-green-700'
                          : candidatura.status.toLowerCase() === 'rejeitado'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {candidatura.status.toUpperCase()}
                      </span>
                    </p>
                    {candidatura.status.toLowerCase() === 'rejeitado' && candidatura.mensagem && (
                      <p className="mt-2 text-red-700 italic">
                        Mensagem do contratante: {candidatura.mensagem}
                      </p>
                    )}
                    {candidatura.status.toLowerCase() === 'aprovado' && candidatura.contato && (
                      <p className="mt-2">
                        📞 <strong>Contato:</strong> {candidatura.contato}
                      </p>
                    )}
                    <button
                      onClick={() => handleExcluirCandidatura(candidatura.id, vaga.id)}
                      className="mt-3 bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1 rounded"
                    >
                      Excluir candidatura
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleCandidatar(vaga)}
                    className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
                  >
                    Candidatar-se
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
