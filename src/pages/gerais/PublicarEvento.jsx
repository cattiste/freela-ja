import React, { useState, useEffect } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { onAuthStateChanged } from 'firebase/auth'

export default function PublicarEvento() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    dataEvento: '',
    cidade: '',
    contato: '',
    valor: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login')
      } else {
        setUsuario(user)
      }
    })
    return () => unsub()
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!form.titulo || !form.descricao || !form.dataEvento || !form.cidade || !form.contato || !form.valor) {
        throw new Error('Preencha todos os campos obrigatórios.')
      }

      const docRef = await addDoc(collection(db, 'eventos'), {
        ...form,
        valor: parseFloat(form.valor),
        status: 'pendente_pagamento',
        criadoEm: serverTimestamp(),
        uidCriador: usuario.uid
      })

      toast.success('Evento criado! Redirecionando para pagamento...')
      navigate(`/pagamento-evento/${docRef.id}`)

    } catch (err) {
      console.error(err)
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="titulo"
          value={form.titulo}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Título do evento"
        />
        <textarea
          name="descricao"
          value={form.descricao}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Descrição"
          rows={3}
        />
        <input
          type="date"
          name="dataEvento"
          value={form.dataEvento}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />
        <input
          name="cidade"
          value={form.cidade}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Cidade"
        />
        <input
          name="contato"
          value={form.contato}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Contato (e-mail ou WhatsApp)"
        />
        <input
          name="valor"
          type="number"
          step="0.01"
          value={form.valor}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Valor do evento (R$)"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
        >
          {loading ? 'Publicando...' : 'Publicar e Pagar'}
        </button>
      </form>
    </div>
  )
}
