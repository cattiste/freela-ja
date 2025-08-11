// src/pages/pf/CandidaturasPF.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function CandidaturasPessoaFisica({ pessoaFisicaUid }) {
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [editandoId, setEditandoId] = useState(null)
  const [mensagemEdit, setMensagemEdit] = useState('')
  const [contatoEdit, setContatoEdit] = useState('')

  useEffect(() => {
    if (!pessoaFisicaUid) return

    const buscarCandidaturas = async () => {
      try {
        const candidaturasRef = collection(db, 'candidaturasPF')
        const q = query(candidaturasRef, where('pessoaFisicaUid', '==', pessoaFisicaUid))
        const snapshot = await getDocs(q)

        const lista = await Promise.all(
          snapshot.docs.map(async docSnap => {
            const data = docSnap.data()

            const freelaRef = doc(db, 'usuarios', data.freelaUid)
            const freelaSnap = await getDoc(freelaRef)

            const servicoRef = doc(db, 'servicos', data.servicoId)
            const servicoSnap = await getDoc(servicoRef)

            return {
              id: docSnap.id,
              ...data,
              freela: freelaSnap.exists() ? freelaSnap.data() : null,
              servico: servicoSnap.exists() ? servicoSnap.data() : null,
            }
          })
        )

        setCandidaturas(lista)
      } catch (err) {
        console.error('Erro ao buscar candidaturas:', err)
        toast.error('Erro ao carregar candidaturas')
      } finally {
        setCarregando(false)
      }
    }

    buscarCandidaturas()
  }, [pessoaFisicaUid])

  const iniciarEdicao = (candidatura) => {
    setEditandoId(candidatura.id)
    setMensagemEdit(candidatura.mensagem || '')
    setContatoEdit(candidatura.contato || '')
  }

  const cancelarEdicao = () => {
    setEditandoId(null)
    setMensagemEdit('')
    setContatoEdit('')
  }

  const salvarStatus = async (id, novoStatus) => {
    try {
      await updateDoc(doc(db, 'candidaturasPF', id), {
        status: novoStatus,
        mensagem: mensagemEdit,
        contato: novoStatus === 'aprovado' ? contatoEdit : '',
        dataResposta: new Date().toISOString()
      })

      setCandidaturas(prev =>
        prev.map(c =>
          c.id === id
            ? {
                ...c,
                status: novoStatus,
                mensagem: mensagemEdit,
                contato: novoStatus === 'aprovado' ? contatoEdit : '',
                dataResposta: new Date().toISOString()
              }
            : c
        )
      )

      if (novoStatus === 'rejeitado') {
        setCandidaturas(prev => prev.filter(c => c.id !== id))
      }

      cancelarEdicao()
      toast.success(`Candidatura ${novoStatus === 'aprovado' ? 'aprovada' : 'rejeitada'} com sucesso!`)
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      toast.error('Erro ao salvar, tente novamente.')
    }
  }

  const excluirCandidatura = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta candidatura?')) {
      try {
        await deleteDoc(doc(db, 'candidaturasPF', id))
        setCandidaturas(prev => prev.filter(c => c.id !== id))
        toast.success('Candidatura excluída com sucesso!')
      } catch (err) {
        console.error('Erro ao excluir candidatura:', err)
        toast.error('Erro ao excluir candidatura')
      }
    }
  }

  if (carregando) {
    return <div className="text-center text-orange-600 mt-8">Carregando candidaturas...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">📋 Candidaturas Recebidas</h2>

      {candidaturas.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow border border-orange-100 text-center">
          <p className="text-gray-600">Nenhuma candidatura recebida ainda.</p>
        </div>
      ) : (
        candidaturas.map(c => (
          <div key={c.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-4">
              {c.freela?.foto ? (
                <img
                  src={c.freela.foto}
                  alt="Foto do freela"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-orange-200 flex items-center justify-center text-xl font-bold text-orange-700">
                  {c.freela?.nome?.[0] || 'F'}
                </div>
              )}

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800">
                  {c.freela?.nome || 'Freelancer Desconhecido'}
                </h3>
                <p className="text-sm text-gray-500">{c.freela?.funcao || 'Função não informada'}</p>
                
                <div className="mt-2">
                  <p className="text-sm font-medium text-orange-700">Serviço:</p>
                  <p className="text-sm">{c.servico?.titulo || 'Serviço não encontrado'}</p>
                </div>

                {c.mensagemFreela && (
                  <div className="mt-2 bg-gray-50 p-2 rounded">
                    <p className="text-sm font-medium">Mensagem do Freela:</p>
                    <p className="text-sm italic">"{c.mensagemFreela}"</p>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  c.status === 'aprovado' ? 'bg-green-100 text-green-700' :
                  c.status === 'rejeitado' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {c.status?.toUpperCase() || 'PENDENTE'}
                </span>
              </div>
            </div>

            {editandoId === c.id ? (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensagem para o freela (opcional):
                  </label>
                  <textarea
                    value={mensagemEdit}
                    onChange={(e) => setMensagemEdit(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                    rows={3}
                    placeholder="Ex: Obrigado pelo interesse, mas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seu contato (se aprovar):
                  </label>
                  <input
                    type="text"
                    value={contatoEdit}
                    onChange={(e) => setContatoEdit(e.target.value)}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Telefone, e-mail ou WhatsApp"
                  />
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => salvarStatus(c.id, 'aprovado')}
                    className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700"
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    onClick={() => salvarStatus(c.id, 'rejeitado')}
                    className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700"
                  >
                    ❌ Rejeitar
                  </button>
                  <button
                    onClick={cancelarEdicao}
                    className="flex-1 bg-gray-500 text-white py-2 rounded hover:bg-gray-600"
                  >
                    ✖ Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => iniciarEdicao(c)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Responder
                </button>
                
                {c.status === 'aprovado' && (
                  <button
                    onClick={() => excluirCandidatura(c.id)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Excluir
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
