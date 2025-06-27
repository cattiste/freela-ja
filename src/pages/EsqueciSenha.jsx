// 📄 src/pages/EsqueciSenha.jsx
import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from @/firebase'

export default function EsqueciSenha() {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')

  const handleEnviar = async (e) => {
    e.preventDefault()
    setMensagem('')
    setErro('')

    try {
      await sendPasswordResetEmail(auth, email)
      setMensagem('✅ Link de recuperação enviado! Verifique seu e-mail.')
      setEmail('')
    } catch (err) {
      setErro('❌ Erro ao enviar link: ' + err.message)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">Recuperar Senha</h2>

      <form onSubmit={handleEnviar} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Digite seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          required
        />

        <button
          type="submit"
          className="btn-primary"
        >
          Enviar link de recuperação
        </button>

        {mensagem && <p className="text-green-600 text-center mt-2">{mensagem}</p>}
        {erro && <p className="text-red-600 text-center mt-2">{erro}</p>}
      </form>
    </div>
  )
}
