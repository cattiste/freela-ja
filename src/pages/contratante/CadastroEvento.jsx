// src/pages/CadastroEvento.jsx
import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useNavigate } from 'react-router-dom'

export default function CadastroEvento() {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [cidade, setCidade] = useState('')
  const [dataEvento, setDataEvento] = useState('')
  const [contato, setContato] = useState('')
  const [urgente, setUrgente] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!titulo || !descricao || !cidade || !dataEvento || !contato) {
      setError('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)
    try {
      await addDoc(collection(db, 'eventos'), {
        titulo,
        descricao,
        cidade,
        dataEvento: new Date(dataEvento).toISOString(),
        contato,
        urgente,
        status: 'ativo',
        dataPublicacao: serverTimestamp(),
        // opcional: se tiver auth, pode adicionar UID do criador
        // criadorUid: auth.currentusuario.uid,
      })
      alert('Evento cadastrado com sucesso!')
      navigate('/freela/buscareventos')
    } catch (err) {
      console.error('Erro ao criar evento:', err)
      setError('Erro ao criar evento. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg mt-12">
      <h2 className="text-2xl font-bold mb-4 text-orange-600 text-center">Criar Evento para Freelancers</h2>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Título do evento"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
          className="input-field"
          required
        />

        <textarea
          placeholder="Descrição do evento"
          value={descricao}
          onChange={e => setDescricao(e.target.value)}
          className="input-field"
          rows={4}
          required
        />

        <input
          type="text"
          placeholder="Cidade"
          value={cidade}
          onChange={e => setCidade(e.target.value)}
          className="input-field"
          required
        />

        <input
          type="date"
          value={dataEvento}
          onChange={e => setDataEvento(e.target.value)}
          className="input-field"
          required
        />

        <input
          type="email"
          placeholder="E-mail para contato"
          value={contato}
          onChange={e => setContato(e.target.value)}
          className="input-field"
          required
        />

        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={urgente}
            onChange={() => setUrgente(!urgente)}
          />
          <span className="text-orange-700 font-semibold">Evento Urgente</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary mt-4"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar Evento'}
        </button>
      </form>
    </div>
  )
}
