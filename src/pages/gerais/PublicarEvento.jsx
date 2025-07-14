// src/pages/PublicarEvento.jsx
import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function PublicarEvento() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [dataEvento, setDataEvento] = useState('')
  const [cidade, setCidade] = useState('')
  const [contato, setContato] = useState('')
  const [status, setStatus] = useState('ativo')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSucesso(null)

    try {
      if (!titulo || !descricao || !dataEvento || !cidade || !contato) {
        throw new Error('Por favor, preencha todos os campos obrigatórios.')
      }

      await addDoc(collection(db, 'eventos'), {
        titulo,
        descricao,
        dataEvento: new Date(dataEvento).toISOString(),
        cidade,
        contato,
        status,
        criadoEm: serverTimestamp(),
      })

      setSucesso('Evento publicado com sucesso!')
      setTitulo('')
      setDescricao('')
      setDataEvento('')
      setCidade('')
      setContato('')
    } catch (err) {
      setError(err.message || 'Erro ao publicar evento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-orange-700 mb-6 text-center">Publicar Evento</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>
      )}

      {sucesso && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-center">{sucesso}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block font-semibold text-orange-700">
          Título do Evento:
          <input
            type="text"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
            required
            className="input-field mt-1"
            placeholder="Ex: Festa de Aniversário"
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Descrição:
          <textarea
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            required
            className="input-field mt-1"
            placeholder="Detalhes do evento, requisitos, local, etc."
            rows={4}
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Data do Evento:
          <input
            type="date"
            value={dataEvento}
            onChange={e => setDataEvento(e.target.value)}
            required
            className="input-field mt-1"
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Cidade:
          <input
            type="text"
            value={cidade}
            onChange={e => setCidade(e.target.value)}
            required
            className="input-field mt-1"
            placeholder="Ex: São Paulo"
          />
        </label>

        <label className="block font-semibold text-orange-700">
          Contato (e-mail ou telefone):
          <input
            type="text"
            value={contato}
            onChange={e => setContato(e.target.value)}
            required
            className="input-field mt-1"
            placeholder="Ex: contato@exemplo.com ou (11) 99999-9999"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-4"
        >
          {loading ? 'Publicando...' : 'Publicar Evento'}
        </button>
      </form>
    </div>
  )
}
