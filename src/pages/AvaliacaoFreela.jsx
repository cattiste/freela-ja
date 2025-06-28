import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function AvaliacaoFreela({ estabelecimento }) {
  const [freelasParaAvaliar, setFreelasParaAvaliar] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState('')
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!estabelecimento?.uid) return

    async function carregarFreelasParaAvaliar() {
      setCarregando(true)
      try {
        const q = query(
          collection(db, 'chamadas'),
          where('estabelecimentoUid', '==', estabelecimento.uid),
          where('status', '==', 'aceita')
        )
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        const semAvaliacao = lista.filter(ch => !ch.avaliado)
        setFreelasParaAvaliar(semAvaliacao)
      } catch (err) {
        console.error('Erro ao carregar freelas para avaliar:', err)
        alert('Erro ao carregar freelancers para avaliar.')
      }
      setCarregando(false)
    }

    carregarFreelasParaAvaliar()
  }, [estabelecimento])

  async function handleEnviarAvaliacao(e) {
    e.preventDefault()
    if (!selecionado) {
      alert('Selecione um freelancer para avaliar.')
      return
    }

    try {
      const chamadaDoc = doc(db, 'chamadas', selecionado.id)
      await updateDoc(chamadaDoc, {
        avaliado: true,
        avaliacao: {
          nota,
          comentario,
          data: new Date()
        }
      })

      alert('Avaliação enviada com sucesso!')

      setFreelasParaAvaliar(prev => prev.filter(ch => ch.id !== selecionado.id))
      setSelecionado(null)
      setNota(5)
      setComentario('')
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err)
      alert('Erro ao enviar avaliação. Tente novamente.')
    }
  }

  if (carregando) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando freelancers para avaliar...
      </div>
    )
  }

  if (freelasParaAvaliar.length === 0) {
    return (
      <p className="text-center text-gray-600 mt-10">
        Nenhum freelancer para avaliar no momento.
      </p>
    )
  }

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-700 mb-4 text-center">
        ⭐ Avaliar Freelancer
      </h2>

      <form onSubmit={handleEnviarAvaliacao} className="bg-white p-6 rounded-xl shadow space-y-4">
        <label className="block font-semibold text-orange-700">
          Selecione o Freelancer:
          <select
            value={selecionado ? selecionado.id : ''}
            onChange={(e) => {
              const escolhido = freelasParaAvaliar.find(f => f.id === e.target.value)
              setSelecionado(escolhido)
            }}
            className="input-field mt-1"
            required
          >
            <option value="" disabled>-- Escolha um freelancer --</option>
            {freelasParaAvaliar.map(f => (
              <option key={f.id} value={f.id}>
                {f.freelaNome || 'Freelancer sem nome'}
              </option>
            ))}
          </select>
        </label>

        <label className="block font-semibold text-orange-700">
          Nota:
          <input
            type="number"
            min="1"
            max="5"
            step="1"
            value={nota}
            onChange={(e) => setNota(Number(e.target.value))}
            className="input-field mt-1"
            required
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Comentário:
          <textarea
            rows="4"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            className="input-field mt-1"
            placeholder="Deixe um comentário sobre o serviço"
            required
          />
        </label>

        <button type="submit" className="btn-primary w-full">
          Enviar Avaliação
        </button>
      </form>
    </div>
  )
}
