import React, { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-hot-toast'

export default function FormEventoPessoaFisica({ usuario }) {
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
      // Navegar para o pagamento dentro do painel, se quiser
      window.location.href = `/pagamento-evento/${docRef.id}`

    } catch (err) {
      console.error(err)
      setError(err.message || 'Erro ao cadastrar evento.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md mt-6 max-w-xl mx-auto">
      <h2 className="text-xl font-bold text-orange-700 mb-4 text-center">Cadastrar Novo Evento</h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="titulo" value={form.titulo} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Título do evento" />
        <textarea name="descricao" value={form.descricao} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Descrição" rows={3} />
        <input type="date" name="dataEvento" value={form.dataEvento} onChange={handleChange} className="w-full p-2 border rounded" />
        <input name="cidade" value={form.cidade} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Cidade" />
        <input name="contato" value={form.contato} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Contato (e-mail ou WhatsApp)" />
        <input name="valor" type="number" step="0.01" value={form.valor} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Valor do evento (R$)" />
        <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700">
          {loading ? 'Cadastrando...' : 'Cadastrar Evento'}
        </button>
      </form>
    </div>
  )
}
