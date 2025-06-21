// src/pages/PainelChef.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PainelChef() {
  const [usuario, setUsuario] = useState(null)
  const [vagas, setVagas] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!usuarioLogado) {
      navigate('/login')
      return
    }
    setUsuario(usuarioLogado)

    // Mock de vagas disponíveis
    setVagas([
      { id: 1, nome: 'Garçom em evento - São Paulo', status: 'Disponível' },
      { id: 2, nome: 'Cozinheiro para buffet - ABC', status: 'Disponível' },
      { id: 3, nome: 'Barista freelance - Centro SP', status: 'Disponível' }
    ])
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/')
  }

  const tocarAlarme = () => {
    const audio = new Audio('/alarme.mp3')
    audio.play()
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white p-6 rounded-lg shadow-md">
        {usuario && (
          <>
            <div className="flex flex-col items-center text-center">
              {usuario.foto ? (
                <img src={usuario.foto} alt="Avatar" className="w-28 h-28 rounded-full object-cover mb-4" />
              ) : (
                <div className="w-28 h-28 rounded-full bg-orange-300 flex items-center justify-center text-white text-2xl font-bold mb-4">
                  {usuario.nome.charAt(0)}
                </div>
              )}
              <h2 className="text-2xl font-bold">{usuario.nome}</h2>
              <p className="text-sm text-gray-500 mb-1">{usuario.funcao}</p>
              <p className="text-sm">📧 {usuario.email}</p>
              <p className="text-sm mb-4">📞 {usuario.telefone}</p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => navigate('/cadastrofreela')}
                  className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
                >
                  Editar Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                >
                  Sair
                </button>
              </div>
            </div>

            <hr className="my-6" />

            <h3 className="text-lg font-bold mb-2">📋 Vagas Disponíveis</h3>
            <ul className="flex flex-col gap-4">
              {vagas.map((vaga) => (
                <li key={vaga.id} className="border p-4 rounded shadow-sm bg-gray-50 hover:bg-gray-100">
                  <p className="font-semibold">{vaga.nome}</p>
                  <p className="text-sm text-green-600">{vaga.status}</p>
                </li>
              ))}
            </ul>

            <button
              onClick={tocarAlarme}
              className="mt-6 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
            >
              🔔 Testar Alarme
            </button>
          </>
        )}
      </div>
    </div>
  )
}
