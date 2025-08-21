// src/pages/admin/LoginAdmin.jsx
import React, { useState } from 'react'
import { auth, db } from '@/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export default function LoginAdmin() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [carregando, setCarregando] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setCarregando(true)

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, senha)
      const docRef = doc(db, 'usuarios', user.uid)
      const snap = await getDoc(docRef)

      if (snap.exists() && snap.data().tipo === 'admin') {
        toast.success('Bem-vindo, administrador!')
        navigate('/painel-admin')
      } else {
        toast.error('Acesso negado. Conta não é admin.')
      }
    } catch (erro) {
      console.error(erro)
      toast.error('Falha ao fazer login.')
    }

    setCarregando(false)
  }

  return (
    <div className="p-6 max-w-sm mx-auto mt-20 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Login Admin</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={carregando}
          className="w-full bg-black text-white p-2 rounded"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  )
}
