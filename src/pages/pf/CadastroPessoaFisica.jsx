// CadastroPessoaFisica.jsx
import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { auth, db } from '@/firebase'

export default function CadastroPessoaFisica() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    senha: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      cidade: '',
      estado: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.senha)
      await setDoc(doc(db, 'usuarios', cred.user.uid), {
        uid: cred.user.uid,
        nome: formData.nome,
        cpf: formData.cpf,
        telefone: formData.telefone,
        email: formData.email,
        endereco: formData.endereco,
        tipo: 'pessoa_fisica',
        criadoEm: serverTimestamp(),
        ultimaAtividade: serverTimestamp()
      })
      navigate('/login')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center" style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}>
      <div className="bg-black bg-opacity-50 min-h-screen flex items-center justify-center p-4">
        <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center text-orange-600 mb-6">Cadastro Pessoa Física</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Nome Completo</label>
              <input name="nome" value={formData.nome} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">CPF</label>
                <input name="cpf" value={formData.cpf} onChange={handleChange} required className="w-full p-2 border rounded" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Telefone</label>
                <input name="telefone" value={formData.telefone} onChange={handleChange} required className="w-full p-2 border rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">E-mail</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Senha</label>
              <input type="password" name="senha" value={formData.senha} onChange={handleChange} required className="w-full p-2 border rounded" />
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Endereço</h3>
              <div className="grid grid-cols-2 gap-2">
                <input name="endereco.cep" value={formData.endereco.cep} onChange={handleChange} placeholder="CEP" className="p-2 border rounded" />
                <input name="endereco.numero" value={formData.endereco.numero} onChange={handleChange} placeholder="Número" className="p-2 border rounded" />
              </div>
              <input name="endereco.rua" value={formData.endereco.rua} onChange={handleChange} placeholder="Rua" className="w-full p-2 border rounded" />
              <input name="endereco.complemento" value={formData.endereco.complemento} onChange={handleChange} placeholder="Complemento" className="w-full p-2 border rounded" />
              <div className="grid grid-cols-2 gap-2">
                <input name="endereco.cidade" value={formData.endereco.cidade} onChange={handleChange} placeholder="Cidade" className="p-2 border rounded" />
                <input name="endereco.estado" value={formData.endereco.estado} onChange={handleChange} placeholder="Estado" className="p-2 border rounded" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition">
              {loading ? 'Cadastrando...' : 'Finalizar Cadastro'}
            </button>

            {error && <p className="text-red-500 text-center">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  )
}
