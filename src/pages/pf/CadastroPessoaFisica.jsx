import React, { useState } from 'react'
import { auth } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function CadastroPessoaFisica() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.senha)
      toast.success('Cadastro realizado com sucesso!')
      navigate('/painelpessoafisica')
    } catch (err) {
      console.error(err)
      toast.error('Erro ao cadastrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold text-orange-700 mb-4 text-center">Cadastro - Pessoa Física</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="nome"
          value={form.nome}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Seu nome"
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="E-mail"
        />

        <input
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          placeholder="Senha"
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
