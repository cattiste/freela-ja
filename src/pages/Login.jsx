import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const encontrado = usuarios.find(u => u.email === email && u.senha === senha)

    if (encontrado) {
      localStorage.setItem('usuarioLogado', JSON.stringify(encontrado))
      if (encontrado.tipo === 'estabelecimento') {
        navigate('/painel-estabelecimento')
      } else {
        navigate('/painel')
      }
    } else {
      setErro('E-mail ou senha incorretos.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-2 border rounded" />
          <input type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full px-4 py-2 border rounded" />
          {erro && <p className="text-sm text-red-500 text-center">{erro}</p>}
          <button type="submit" className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700 transition">Entrar</button>
        </form>
      </div>
    </div>
  )
}
