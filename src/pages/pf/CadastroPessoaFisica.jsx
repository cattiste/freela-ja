import React, { useState } from 'react'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'

export default function CadastroPessoaFisica() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    cpf: '',
    celular: '',
    endereco: '',
    foto: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Validações
    if (form.senha !== form.confirmarSenha) {
      return setError('As senhas não coincidem')
    }
    if (!form.cpf || form.cpf.length !== 11) {
      return setError('CPF inválido (deve ter 11 dígitos)')
    }

    setLoading(true)
    try {
      // 1. Criar usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        form.email,
        form.senha
      )

      // 2. Atualizar perfil com nome
      await updateProfile(userCredential.user, {
        displayName: form.nome
      })

      // 3. Salvar dados adicionais no Firestore
      const userDoc = {
        uid: userCredential.user.uid,
        nome: form.nome,
        email: form.email,
        cpf: form.cpf,
        celular: form.celular,
        endereco: form.endereco,
        foto: form.foto || '',
        tipo: 'pessoa_fisica',
        criadoEm: new Date().toISOString()
      }

      await setDoc(doc(db, 'usuarios', userCredential.user.uid), userDoc)

      toast.success('Cadastro realizado com sucesso!')
      navigate('/painelpessoafisica')
    } catch (err) {
      console.error('Erro no cadastro:', err)
      setError(err.message || 'Erro ao realizar cadastro')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-orange-700 mb-4 text-center">
          Cadastro de Pessoa Física
        </h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Para contratar freelancers para seus eventos pessoais
        </p>

        {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
              <input
                type="password"
                name="senha"
                value={form.senha}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha *</label>
              <input
                type="password"
                name="confirmarSenha"
                value={form.confirmarSenha}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CPF *</label>
              <input
                type="text"
                name="cpf"
                value={form.cpf}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                placeholder="Somente números"
                required
                pattern="\d{11}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Celular *</label>
              <input
                type="tel"
                name="celular"
                value={form.celular}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                placeholder="(00) 00000-0000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Endereço *</label>
            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="Rua, número, bairro - Cidade/UF"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL da Foto (opcional)</label>
            <input
              type="url"
              name="foto"
              value={form.foto}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              placeholder="https://..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded hover:bg-orange-700 transition disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Já tem uma conta?{' '}
          <button 
            onClick={() => navigate('/login')} 
            className="text-orange-600 hover:underline"
          >
            Faça login
          </button>
        </p>
      </div>
    </div>
  )
}