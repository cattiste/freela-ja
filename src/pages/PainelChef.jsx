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
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Painel do Freelancer</h1>

      {/* ✅ Imagem do freela com estilo redondo e fallback */}
      <img
        src={imagemFreela || defaultAvatar}
        alt="Foto do Freelancer"
        className="w-32 h-32 object-cover rounded-full shadow-md border-2 border-gray-300 mb-4"
      />

      {/* ✅ Informações fixas */}
      <p className="text-lg font-medium text-gray-800">Nome: João da Silva</p>
      <p className="text-gray-600">Função: Cozinheiro</p>
      <p className="text-gray-600">E-mail: joao@email.com</p>
      <p className="text-gray-600 mb-6">Telefone: (11) 99999-9999</p>

      {/* ✅ Botões com estilo da home */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
        <button
          onClick={() => navigate('/cadastrofreela')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all"
        >
          Editar Perfil
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all"
        >
          Sair
        </button>
      </div>

      {/* ✅ Vagas */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Vagas Disponíveis</h2>
      <div className="w-full max-w-xl mb-10">
        {vagasDisponiveis.length === 0 && (
          <p className="text-gray-500">Nenhuma vaga disponível no momento.</p>
        )}
        {vagasDisponiveis.map((vaga, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow border mb-4">
            <p className="font-bold text-gray-700 mb-2">{vaga}</p>
            <button
              onClick={() => handleCandidatar(vaga)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-all"
            >
              Candidatar-se
            </button>
          </div>
        ))}
      </div>

      {/* ✅ Candidaturas */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Minhas Candidaturas</h2>
      <div className="w-full max-w-xl mb-8">
        {candidaturas.length === 0 && (
          <p className="text-gray-500">Você ainda não se candidatou a nenhuma vaga.</p>
        )}
        {candidaturas.map((vaga, index) => (
          <div
            key={index}
            className="bg-yellow-50 p-4 rounded-xl border border-yellow-300 shadow mb-3"
          >
            <p className="text-yellow-800 font-medium">{vaga}</p>
          </div>
        ))}
      </div>

      {/* ✅ Simulador de chamado */}
      <button
        onClick={tocarAlarme}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition-all"
      >
        Simular Chamado (Alarme)
      </button>
    </div>
  )
}
