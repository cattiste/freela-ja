import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import emailjs from 'emailjs-com' 

import { toast } from 'react-hot-toast'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

export default function VerificacaoEmail() {
  const { usuario } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const { nome, email } = location.state || {}
  const [codigoGerado, setCodigoGerado] = useState('')
  const [codigoDigitado, setCodigoDigitado] = useState('')
  const [reenviando, setReenviando] = useState(false)

  useEffect(() => {
    if (nome && email) {
      gerarEEnviarCodigo()
    }
  }, [nome, email])

  const gerarEEnviarCodigo = async () => {
    const codigo = Math.floor(100000 + Math.random() * 900000).toString()
    setCodigoGerado(codigo)

    const templateParams = {
      to_name: nome,
      to_email: email,
      codigo
    }

    try {
      await emailjs.send(
        'freelaja_smtp',         // ✅ Seu service ID do EmailJS
        'template_nj4r0lv',      // ✅ Seu template ID do EmailJS
        templateParams,
        'L0mgBTNVss-5NpWbp'      // ✅ Sua public key do EmailJS
      )
      toast.success('Código enviado para seu e-mail.')
    } catch (error) {
      console.error(error)
      toast.error('Erro ao enviar e-mail.')
    }
  }

  const verificarCodigo = async () => {
    if (codigoDigitado === codigoGerado) {
      try {
        await updateDoc(doc(db, 'usuarios', usuario.uid), {
          email_verificado: true
        })
        toast.success('E-mail verificado com sucesso!')

        if (usuario?.tipo === 'freela') {
          navigate('/painel-freela')
        } else {
          navigate('/painel-estabelecimento')
        }
      } catch (err) {
        toast.error('Erro ao salvar verificação.')
        console.error(err)
      }
    } else {
      toast.error('Código incorreto!')
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Verifique seu E-mail</h2>
        <p className="mb-4">
          Enviamos um código de verificação para: <strong>{email}</strong>
        </p>

        <input
          type="text"
          value={codigoDigitado}
          onChange={(e) => setCodigoDigitado(e.target.value)}
          maxLength={6}
          placeholder="Digite o código"
          className="border border-gray-300 rounded-md px-4 py-2 mb-4 w-full text-center text-xl"
        />

        <button
          onClick={verificarCodigo}
          className="bg-blue-600 text-white px-4 py-2 rounded-md w-full mb-2"
        >
          Verificar Código
        </button>

        <button
          onClick={gerarEEnviarCodigo}
          disabled={reenviando}
          className="text-sm text-blue-500 hover:underline mt-2"
        >
          Reenviar código
        </button>
      </div>
    </div>
  )
}
