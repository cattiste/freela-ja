import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PublicarVaga({ estabelecimento }) {
  const [tipoVaga, setTipoVaga] = useState('clt') // valor padrão 'clt'
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [local, setLocal] = useState('')
  const [pagamento, setPagamento] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSucesso(null)

    if (!titulo || !descricao || !local || !pagamento) {
      setError('Preencha todos os campos.')
      setLoading(false)
      return
    }

    try {
      await addDoc(collection(db, 'vagas'), {
        tipoVaga,
        titulo,
        descricao,
        local,
        pagamento: Number(pagamento),
        estabelecimentoUid: estabelecimento?.uid || null,
        estabelecimentoNome: estabelecimento?.nome || null,
        dataPublicacao: serverTimestamp(),
        status: 'ativo',
      })

      setSucesso('Vaga publicada com sucesso!')
      setTipoVaga('clt')
      setTitulo('')
      setDescricao('')
      setLocal('')
      setPagamento('')
    } catch (err) {
      setError('Erro ao publicar vaga: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">📢 Publicar Nova Vaga</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {sucesso && <p className="text-green-600 mb-4">{sucesso}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="font-semibold text-orange-700">Tipo de Vaga:</span>
          <select
            value={tipoVaga}
            onChange={e => setTipoVaga(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          >
            <option value="clt">CLT (Fixa)</option>
            <option value="freela">Freela (Diária)</option>
          </select>
        </label>

        <input
          type="text"
          placeholder="Título da Vaga"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Descrição"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Local"
          value={local}
          onChange={e => setLocal(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Pagamento (R$)"
          value={pagamento}
          onChange={e => setPagamento(e.target.value)}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
        >
          {loading ? 'Publicando...' : 'Publicar Vaga'}
        </button>
      </form>
    </div>
  )
}
