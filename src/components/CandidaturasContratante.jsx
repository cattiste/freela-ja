import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function CandidaturasContratante({ contratanteUid }) {
  const [candidaturas, setCandidaturas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [editandoId, setEditandoId] = useState(null)
  const [mensagemEdit, setMensagemEdit] = useState('')
  const [contatoEdit, setContatoEdit] = useState('')

  useEffect(() => {
    if (!contratanteUid) return

    const buscarCandidaturas = async () => {
      try {
        const candidaturasRef = collection(db, 'candidaturas')
        const q = query(candidaturasRef, where('contratanteUid', '==', contratanteUid))
        const snapshot = await getDocs(q)

        const lista = await Promise.all(
          snapshot.docs.map(async docSnap => {
            const data = docSnap.data()

            // Buscar dados do freela
            const freelaRef = doc(db, 'usuarios', data.freelaUid)
            const freelaSnap = await getDoc(freelaRef)

            // Buscar dados da vaga
            const vagaRef = doc(db, 'vagas', data.vagaId)
            const vagaSnap = await getDoc(vagaRef)

            return {
              id: docSnap.id,
              ...data,
              freela: freelaSnap.exists() ? freelaSnap.data() : null,
              vaga: vagaSnap.exists() ? vagaSnap.data() : null,
            }
          })
        )

        setCandidaturas(lista)
      } catch (err) {
        console.error('Erro ao buscar candidaturas:', err)
      } finally {
        setCarregando(false)
      }
    }

    buscarCandidaturas()
  }, [contratanteUid])

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
      // Atualiza doc no Firestore com status, mensagem e contato
      await updateDoc(doc(db, 'candidaturas', id), {
        status: novoStatus,
        mensagem: mensagemEdit,
        contato: novoStatus === 'aprovado' ? contatoEdit : '',
      })

      // Atualiza localmente o estado para re-renderizar
      setCandidaturas(prev =>
        prev.map(c =>
          c.id === id
            ? {
                ...c,
                status: novoStatus,
                mensagem: mensagemEdit,
                contato: novoStatus === 'aprovado' ? contatoEdit : '',
              }
            : c
        )
      )

      // Se for rejeitado, e mensagem preenchida, remove do estado (sai da tela)
      if (novoStatus === 'rejeitado' && mensagemEdit.trim() !== '') {
        setCandidaturas(prev => prev.filter(c => c.id !== id))
      }

      cancelarEdicao()
    } catch (err) {
      console.error('Erro ao atualizar status:', err)
      alert('Erro ao salvar, tente novamente.')
    }
  }

  const excluirCandidatura = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta candidatura?')) {
      try {
        await deleteDoc(doc(db, 'candidaturas', id))
        setCandidaturas(prev => prev.filter(c => c.id !== id))
      } catch (err) {
        console.error('Erro ao excluir candidatura:', err)
      }
    }
  }

  if (carregando) {
    return <p className="text-center text-orange-600">Carregando candidaturas...</p>
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">📋 Candidaturas Recebidas</h2>

      {candidaturas.length === 0 ? (
        <p className="text-gray-600">Nenhuma candidatura recebida ainda.</p>
      ) : (
        candidaturas.map(c => (
          <div
            key={c.id}
            className="border border-gray-300 rounded-xl p-6 flex flex-col bg-white shadow-sm"
          >
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

              <div>
                <p className="text-lg font-semibold text-gray-800">
                  {c.freela?.nome || 'Freelancer Desconhecido'}
                </p>
                <p className="text-sm text-gray-500">{c.freela?.funcao || 'Função não informada'}</p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-medium text-orange-700">Vaga:</span> {c.vaga?.titulo || 'Vaga desconhecida'}
                </p>
                <p className="text-sm mt-1">
                  <span className="font-medium">Status:</span>{' '}
                  <span
                    className={`px-2 py-0.5 rounded ${
                      c.status?.toLowerCase() === 'aprovado'
                        ? 'bg-green-100 text-green-700'
                        : c.status?.toLowerCase() === 'rejeitado'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {c.status?.toUpperCase() || 'PENDENTE'}
                  </span>
                </p>
              </div>
            </div>

            {/* Se está editando esta candidatura */}
            {editandoId === c.id ? (
              <>
                <label className="block mb-2 font-semibold text-gray-700">
                  Mensagem para o freela (aparecerá se rejeitado):
                </label>
                <textarea
                  className="w-full border rounded p-2 mb-4"
                  rows={3}
                  value={mensagemEdit}
                  onChange={e => setMensagemEdit(e.target.value)}
                  placeholder="Exemplo: Obrigado pelo interesse, mas não foi desta vez."
                />

                {/* Se aprovando, mostrar campo contato */}
                <label className="block mb-2 font-semibold text-gray-700">
                  {`Contato do contratante (aparecerá se aprovado):`}
                </label>
                <input
                  type="text"
                  className="w-full border rounded p-2 mb-4"
                  value={contatoEdit}
                  onChange={e => setContatoEdit(e.target.value)}
                  placeholder="Email, telefone ou outro contato"
                />

                <div className="flex gap-4">
                  <button
                    onClick={() => salvarStatus(c.id, 'aprovado')}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    ✅ Aprovar
                  </button>
                  <button
                    onClick={() => salvarStatus(c.id, 'rejeitado')}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    ❌ Rejeitar
                  </button>
                  <button
                    onClick={cancelarEdicao}
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                  >
                    ✖ Cancelar
                  </button>
                </div>
              </>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => iniciarEdicao(c)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  ✏️ Editar Resposta
                </button>

                {/* Botão excluir só aparece se status aprovado */}
                {c.status?.toLowerCase() === 'aprovado' && (
                  <button
                    onClick={() => {
                      if (
                        window.confirm('Tem certeza que deseja excluir esta candidatura?')
                      ) {
                        deleteDoc(doc(db, 'candidaturas', c.id))
                          .then(() =>
                            setCandidaturas(prev => prev.filter(item => item.id !== c.id))
                          )
                          .catch(err => console.error('Erro ao excluir candidatura:', err))
                      }
                    }}
                    className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    🗑️ Excluir
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
