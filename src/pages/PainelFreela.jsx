import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserEdit, FaSignOutAlt, FaBell } from 'react-icons/fa'
import somAlarme from '../assets/alarme.mp3'

const avatarFallback = 'https://i.imgur.com/3W8i1sT.png' // ou qualquer URL de avatar padrão

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [chamado, setChamado] = useState(false)

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuario || usuario.tipo !== 'freela') {
      navigate('/login')
      return
    }

    setFreela(usuario)

    const chamadoAtual = localStorage.getItem('freelaChamado')
    if (chamadoAtual && chamadoAtual === usuario.nome) {
      setChamado(true)
      const audio = new Audio(somAlarme)
      audio.play()
    }
  }, [navigate])

  const handleSair = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const handleAceitar = () => {
    alert('Você aceitou o chamado!')
    localStorage.removeItem('freelaChamado')
    setChamado(false)
  }

  const handleRecusar = () => {
    alert('Você recusou o chamado.')
    localStorage.removeItem('freelaChamado')
    setChamado(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex flex-col items-center p-6">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">👨‍🍳 Painel do Freelancer</h1>

        {freela && (
          <>
            <img
              src={freela.foto || avatarFallback}
              onError={(e) => e.target.src = avatarFallback}
              alt="Foto do Freela"
              className="w-28 h-28 rounded-full mx-auto mb-4 object-cover border-4 border-slate-300"
            />
            <h2 className="text-xl font-semibold text-slate-700">{freela.nome}</h2>
            <p className="text-slate-600 mb-1"><strong>Função:</strong> {freela.funcao}</p>
            <p className="text-slate-600 mb-1"><strong>Email:</strong> {freela.email}</p>
            <p className="text-slate-600"><strong>Celular:</strong> {freela.celular}</p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => alert('Função futura')}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg shadow-md transition"
              >
                <FaUserEdit /> Editar Perfil
              </button>
              <button
                onClick={handleSair}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition"
              >
                <FaSignOutAlt /> Sair
              </button>
            </div>
          </>
        )}
      </div>

      {chamado && (
        <div className="mt-6 w-full max-w-md bg-red-100 border-l-8 border-red-600 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-red-700 text-lg font-bold mb-2">
            <FaBell className="animate-bounce" /> Você foi chamado!
          </div>
          <p className="text-sm text-red-800">Um estabelecimento solicitou seus serviços. Deseja aceitar?</p>
          <div className="flex justify-center gap-4 mt-4">
            <button
              onClick={handleAceitar}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
            >
              Aceitar
            </button>
            <button
              onClick={handleRecusar}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
            >
              Recusar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
