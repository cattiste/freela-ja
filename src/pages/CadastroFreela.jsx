import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function CadastroFreela() {
  const navigate = useNavigate()
  const [foto, setFoto] = useState(null)

  const handleFotoChange = (e) => {
    setFoto(e.target.files[0])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Cadastro enviado')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 p-6">
      <h1 className="text-3xl font-bold text-orange-600 mb-4 text-center">Cadastro de Freelancer</h1>
      <p className="text-gray-700 mb-6 text-center">
        Preencha seus dados para se cadastrar como profissional.
      </p>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl flex flex-col gap-4">
        <input type="file" accept="image/*" onChange={handleFotoChange} className="p-3 rounded-md border border-gray-300 w-full bg-white" />
        <input type="text" placeholder="Nome completo" className="p-3 rounded-md border border-gray-300 w-full" />
        <input type="email" placeholder="E-mail" className="p-3 rounded-md border border-gray-300 w-full" />
        <input type="tel" placeholder="Celular" className="p-3 rounded-md border border-gray-300 w-full" />
        <input type="text" placeholder="Endereço" className="p-3 rounded-md border border-gray-300 w-full" />
        <input type="text" placeholder="Função (ex: Cozinheiro, Garçom...)" className="p-3 rounded-md border border-gray-300 w-full" />

        <button type="submit" className="bg-orange-500 text-white font-semibold py-3 px-6 rounded-md hover:bg-orange-600 transition-all">
          Cadastrar
        </button>

        <button type="button" onClick={() => navigate('/')} className="mt-4 text-sm text-orange-600 underline hover:text-orange-800">
          Voltar à página inicial
        </button>
      </form>
    </div>
  )
}
