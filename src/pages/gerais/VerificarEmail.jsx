// src/pages/gerais/VerificarEmail.jsx
import React from 'react'
import { useLocation } from 'react-router-dom'

export default function VerificarEmail() {
  const location = useLocation()
  const { nome, email } = location.state || {}

  return (
    <div className="min-h-screen bg-orange-50 flex justify-center items-center px-4">
      <div className="bg-white max-w-xl w-full rounded-2xl shadow p-8 text-center space-y-4">
        <h1 className="text-2xl font-bold text-orange-700">Verifique seu e-mail</h1>
        <p className="text-gray-700">
          Olá <strong>{nome || 'usuário'}</strong>!
        </p>
        <p className="text-gray-700">
          Enviamos um link de verificação para o e-mail:
          <br />
          <strong className="text-blue-700">{email || 'seu e-mail'}</strong>
        </p>
        <p className="text-sm text-gray-600">
          Acesse sua caixa de entrada e clique no link para ativar sua conta.
        </p>
        <div className="text-sm text-gray-500">
          📌 Se não encontrar, verifique também na pasta de spam/lixo eletrônico.
        </div>
      </div>
    </div>
  )
}
