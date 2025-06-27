import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PublicarVaga({ estabelecimento }) {
  const [tipo, setTipo] = useState('freela') // freela ou clt
  const [funcao, setFuncao] = useState('')
  const [descricao, setDescricao] = useState('')
  const [valorDiaria, setValorDiaria] = useState('')
  const [data, setData] = useState('')
  const [urgente, setUrgente] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  async function handlePublicar(e) {
    e.preventDefault()
    if (!funcao.trim()) {
      alert('Preencha a função da vaga')
      return
    }
    if (tipo === 'freela' && !valorDiaria) {
      alert('Preencha o valor da diária para vagas de freelas')
      return
    }
    if (!data) {
      alert('Escolha a data da vaga')
      return
    }

    setLoading(true)
    setMensagem(null)

    try {
      await addDoc(collection(db, 'vagas'), {
        estabelecimentoUid: estabelecimento.uid,
        tipo,
        funcao,
        descricao,
        valorDiaria: tipo === 'freela' ? Number(valorDiaria) : null,
        data,
        urgente,
        status: 'aberta',
        criadoEm: serverTimestamp(),
      })
      setMensagem('Vaga publicada com sucesso!')
      setFuncao('')
      setDescricao('')
      setValorDiaria('')
      setData('')
      setUrgente(false)
    } catch (err) {
      console.error('Erro ao publicar vaga:', err)
      setMensagem('Erro ao publicar a vaga. Tente novamente.')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-orange-700 mb-6">📢 Publicar Vaga</h2>

      {mensagem && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-700">{mensagem}</div>
      )}

      <form onSubmit={handlePublicar} className="space-y-4">
        <label className="block">
          Tipo de vaga:
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="input-field mt-1"
          >
            <option value="freela">Freela (Diária)</option>
            <option value="clt">CLT (Fixa)</option>
          </select>
        </label>

        <label className="block">
          Função / Título:
          <input
            type="text"
            value={funcao}
            onChange={e => setFuncao(e.target.value)}
            className="input-field mt-1"
            placeholder="Ex: Garçom, Cozinheiro"
            required
          />
        </label>

        <label className="block">
          Descrição:
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            className="input-field mt-1"
            rows={4}
            placeholder="Detalhes da vaga"
          />
        </label>

        {tipo === 'freela' && (
          <label className="block">
            Valor da diária (R$):
            <input
              type="number"
              min="0"
              step="0.01"
              value={valorDiaria}
              onChange={e => setValorDiaria(e.target.value)}
              className="input-field mt-1"
              required={tipo === 'freela'}
            />
          </label>
        )}

        <label className="block">
          Data da vaga:
          <input
            type="date"
            value={data}
            onChange={e => setData(e.target.value)}
            className="input-field mt-1"
            required
          />
        </label>

        <label className="block flex items-center space-x-2 mt-2">
          <input
            type="checkbox"
            checked={urgente}
            onChange={e => setUrgente(e.target.checked)}
          />
          <span>Urgente</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-4"
        >
          {loading ? 'Publicando...' : 'Publicar Vaga'}
        </button>
      </form>
    </div>
  )
}
