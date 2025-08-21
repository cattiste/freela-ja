import React, { useEffect, useState } from 'react'
import { auth } from '@/firebase'
import { sendEmailVerification } from 'firebase/auth'
import { useLocation, useNavigate } from 'react-router-dom'

export default function VerificarEmail() {
  const [reenviando, setReenviando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const navigate = useNavigate()
  const location = useLocation()

  const nome = location.state?.nome || ''
  const email = location.state?.email || auth.currentUser?.email || ''

  const handleReenviar = async () => {
    if (!auth.currentUser) {
      setMensagem('Usuário não autenticado.')
      return
    }
    setReenviando(true)
    try {
      await sendEmailVerification(auth.currentUser)
      setMensagem('✅ E-mail de verificação reenviado com sucesso.')
    } catch (err) {
      console.error('Erro ao reenviar verificação:', err)
      setMensagem('Erro ao reenviar e-mail de verificação.')
    } finally {
      setReenviando(false)
    }
  }

  useEffect(() => {
    const interval = setInterval(async () => {
      if (auth.currentUser) {
        await auth.currentUser.reload()
        if (auth.currentUser.emailVerified) {
          clearInterval(interval)
          navigate('/login')
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50 p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg text-center space-y-4">
        <h1 className="text-2xl font-bold text-orange-700">Verifique seu E-mail</h1>
        <p className="text-gray-700">
          Olá <strong>{nome}</strong>, enviamos um link de verificação para o e-mail:
        </p>
        <p className="text-blue-700 font-medium">{email}</p>
        <p className="text-sm text-gray-600">
          Após verificar, esta página será atualizada automaticamente.
        </p>
        {mensagem && <p className="text-green-600">{mensagem}</p>}

        <button
          onClick={handleReenviar}
          disabled={reenviando}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition disabled:opacity-50"
        >
          {reenviando ? 'Reenviando...' : 'Reenviar e-mail de verificação'}
        </button>
      </div>
    </div>
  )
}
