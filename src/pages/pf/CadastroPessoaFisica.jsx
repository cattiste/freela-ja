import React, { useState } from 'react'
import { auth, db } from '@/firebase'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { doc, setDoc } from 'firebase/firestore'

function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i)
  let resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  if (resto !== parseInt(cpf.charAt(9))) return false
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i)
  resto = (soma * 10) % 11
  if (resto === 10 || resto === 11) resto = 0
  return resto === parseInt(cpf.charAt(10))
}

export default function CadastroPessoaFisica() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    celular: '',
    cpf: '',
    endereco: '',
    foto: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, foto: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarCPF(form.cpf)) {
      toast.error('CPF inválido')
      return
    }

    setLoading(true)

    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.senha)

      await setDoc(doc(db, 'pessoasFisicas', user.uid), {
        uid: user.uid,
        nome: form.nome,
        email: form.email,
        celular: form.celular,
        cpf: form.cpf,
        endereco: form.endereco,
        foto: form.foto || '',
        criadoEm: new Date()
      })

      toast.success('Cadastro realizado com sucesso!')
      navigate('/painelpf')
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/email-already-in-use') {
        toast.error('Este e-mail já está em uso. Faça login ou use outro e-mail.')
      } else {
        toast.error('Erro ao cadastrar')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}
    >
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-xl font-bold text-orange-700 mb-4 text-center">Cadastro - Pessoa Física</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="nome" value={form.nome} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Nome completo" required />
          <input type="email" name="email" value={form.email} onChange={handleChange} className="w-full p-2 border rounded" placeholder="E-mail" required />
          <input type="password" name="senha" value={form.senha} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Senha" required />
          <input name="celular" value={form.celular} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Celular com DDD" required />
          <input name="cpf" value={form.cpf} onChange={handleChange} className="w-full p-2 border rounded" placeholder="CPF" required />
          <input name="endereco" value={form.endereco} onChange={handleChange} className="w-full p-2 border rounded" placeholder="Endereço completo" required />
          <input type="file" accept="image/*" onChange={handleFileChange} className="w-full" />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
