import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import defaultAvatar from '../assets/avatar.png' // fallback se não houver imagem
import alarmeSound from '../assets/alarme.mp3'

export default function PainelChef() {
  const navigate = useNavigate()
  const [vagasDisponiveis, setVagasDisponiveis] = useState([])
  const [candidaturas, setCandidaturas] = useState([])
  const [imagemFreela, setImagemFreela] = useState(null)

  useEffect(() => {
    const vagas = JSON.parse(localStorage.getItem('vagas')) || []
    const candidaturasSalvas = JSON.parse(localStorage.getItem('candidaturas')) || []
    const imagem = localStorage.getItem('imagemFreela')
    setVagasDisponiveis(vagas)
    setCandidaturas(candidaturasSalvas)
    setImagemFreela(imagem)
  }, [])

  const handleCandidatar = (vaga) => {
    if (!candidaturas.includes(vaga)) {
      const atualizadas = [...candidaturas, vaga]
      setCandidaturas(atualizadas)
      localStorage.setItem('candidaturas', JSON.stringify(atualizadas))
    }
  }

  const tocarAlarme = () => {
    const audio = new Audio(alarmeSound)
    audio.play()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-50 text-center">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Painel do Freelancer</h1>

      <img
        src={imagemFreela || defaultAvatar}
        alt="Foto do Freelancer"
        className="w-40 h-40 object-cover rounded-full shadow-lg border-2 border-gray-300 mb-4"
      />

      <p className="text-lg font-medium text-gray-700">Nome: João da Silva</p>
      <p className="text-gray-600">Função: Cozinheiro</p>
      <p className="text-gray-600">E-mail: joao@email.com</p>
      <p className="text-gray-600 mb-6">Telefone: (11) 99999-9999</p>

      <div className="flex flex-col md:flex-row justify-center gap-4 mb-6">
        <button
          onClick={() => navigate('/cadastrofreela')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-xl shadow transition-all duration-200"
        >
          Editar Perfil
        </button>

        <button
          onClick={() => navigate('/')}
          className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-xl shadow transition-all duration-200"
        >
          Sair
        </button>
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mt-4 mb-2">Vagas Disponíveis</h2>
      <div className="w-full max-w-xl mb-10">
        {vagasDisponiveis.length === 0 && <p className="text-gray-500">Nenhuma vaga disponível no momento.</p>}
        {vagasDisponiveis.map((vaga, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow mb-4">
            <p className="font-bold text-gray-700">{vaga}</p>
            <button
              onClick={() => handleCandidatar(vaga)}
              className="mt-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1 rounded-lg shadow transition-all"
            >
              Candidatar-se
            </button>
          </div>
        ))}
      </div>

      <h2 className="text-2xl font-semibold text-gray-800 mb-2">Minhas Candidaturas</h2>
      <div className="w-full max-w-xl">
        {candidaturas.length === 0 && <p className="text-gray-500">Você ainda não se candidatou a nenhuma vaga.</p>}
        {candidaturas.map((vaga, index) => (
          <div key={index} className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 shadow mb-2">
            <p className="text-yellow-800 font-medium">{vaga}</p>
          </div>
        ))}
      </div>

      <button
        onClick={tocarAlarme}
        className="mt-8 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-xl shadow transition-all duration-200"
      >
        Simular Chamado (Alarme)
      </button>
    </div>
  )
}
