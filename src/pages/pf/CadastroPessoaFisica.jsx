import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function CadastroPessoaFisica() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    celular: '',
    cidade: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, form.email, form.senha)
      const uid = userCredential.user.uid

      await setDoc(doc(db, 'usuarios', uid), {
        ...form,
        tipo: 'pf',
        criadoEm: serverTimestamp()
      })

      toast.success('Cadastro realizado com sucesso!')
      navigate('/painelpf')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao cadastrar. Verifique os dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-12 bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-bold text-orange-700 mb-6 text-center">Cadastro Pessoa Física</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
          placeholder="Nome completo"
        />
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
          placeholder="Email"
        />
        <input
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
          placeholder="Senha"
        />
        <input
          name="celular"
          value={form.celular}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
          placeholder="Celular / WhatsApp"
        />
        <input
          name="cidade"
          value={form.cidade}
          onChange={handleChange}
          required
          className="w-full p-2 border rounded"
          placeholder="Cidade"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>
    </div>
  )
}
