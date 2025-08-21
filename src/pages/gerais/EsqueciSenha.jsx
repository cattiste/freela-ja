import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/firebase'
import { Link } from 'react-router-dom'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const handleEnviar = async (e) => {
    e.preventDefault()
    setErro('')
    setMensagem('')
    setCarregando(true)

    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase())
      setEnviado(true)
      setMensagem('E-mail enviado com sucesso! Verifique sua caixa de entrada.')
    } catch (err) {
      console.error(err)
      if (err.code === 'auth/user-not-found') {
        setErro('Usuário não encontrado com esse e-mail.')
      } else if (err.code === 'auth/invalid-email') {
        setErro('E-mail inválido.')
      } else {
        setErro('Erro ao enviar e-mail. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat relative" style={{ backgroundImage: "url('/img/fundo-login.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 z-0" />
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <h2 className="text-2xl font-bold text-white mb-6 drop-shadow">Recuperar Senha</h2>

        <form onSubmit={handleEnviar} className="w-full max-w-md bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg space-y-4">
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition duration-300 disabled:opacity-60"
          >
            {carregando ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>

          {mensagem && <p className="text-green-600 text-center text-sm">{mensagem}</p>}
          {erro && <p className="text-red-600 text-center text-sm">{erro}</p>}
        </form>

        {enviado && (
          <p className="text-sm text-white mt-4">
            <Link to="/login" className="underline text-blue-200">
              Voltar para o login
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}
