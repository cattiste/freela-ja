import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaUserEdit, FaSignOutAlt, FaBell } from 'react-icons/fa'
import somAlarme from '../assets/alarme.mp3'

const avatarFallback = 'https://i.imgur.com/3W8i1sT.png'

export default function PainelFreela() {
  const navigate = useNavigate()
  const [freela, setFreela] = useState(null)
  const [chamado, setChamado] = useState(false)
  const [editando, setEditando] = useState(false)
  const [historico, setHistorico] = useState([])

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

    const historicoSalvo = JSON.parse(localStorage.getItem('freelaHistorico') || '[]')
    setHistorico(historicoSalvo)
  }, [navigate])

  const handleSair = () => {
    localStorage.removeItem('usuarioLogado')
    navigate('/login')
  }

  const salvarHistorico = (status) => {
    if (!freela) return
    const entrada = {
      nome: freela.nome,
      data: new Date().toLocaleString(),
      status
    }
    const historicoAtual = JSON.parse(localStorage.getItem('freelaHistorico') || '[]')
    historicoAtual.unshift(entrada)
    localStorage.setItem('freelaHistorico', JSON.stringify(historicoAtual))
    setHistorico(historicoAtual)
  }

  const handleAceitar = () => {
    salvarHistorico('Aceito')
    localStorage.removeItem('freelaChamado')
    setChamado(false)
  }

  const handleRecusar = () => {
    salvarHistorico('Recusado')
    localStorage.removeItem('freelaChamado')
    setChamado(false)
  }

  const salvarAlteracoes = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const atualizados = usuarios.map(u =>
      u.email === freela.email ? freela : u
    )
    localStorage.setItem('usuarios', JSON.stringify(atualizados))
    localStorage.setItem('usuarioLogado', JSON.stringify(freela))
    setEditando(false)
    alert('Perfil atualizado com sucesso!')
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
            <p className="text-slate-600 mb-1"><strong>Celular:</strong> {freela.celular}</p>
            <p className="text-slate-600"><strong>Endereço:</strong> {freela.endereco}</p>

            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setEditando(true)}
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

      {editando && freela && (
        <div className="mt-6 bg-slate-50 p-4 rounded-lg shadow-inner w-full max-w-md">
          <h3 className="text-lg font-semibold mb-2 text-slate-700">Editar Perfil</h3>

          <div className="space-y-2">
            <input type="text" value={freela.nome} onChange={e => setFreela({ ...freela, nome: e.target.value })} placeholder="Nome" className="w-full p-2 border rounded" />
            <input type="email" value={freela.email} onChange={e => setFreela({ ...freela, email: e.target.value })} placeholder="Email" className="w-full p-2 border rounded" />
            <input type="text" value={freela.celular} onChange={e => setFreela({ ...freela, celular: e.target.value })} placeholder="Celular" className="w-full p-2 border rounded" />
            <input type="text" value={freela.endereco} onChange={e => setFreela({ ...freela, endereco: e.target.value })} placeholder="Endereço" className="w-full p-2 border rounded" />
            <input type="text" value={freela.funcao} onChange={e => setFreela({ ...freela, funcao: e.target.value })} placeholder="Função" className="w-full p-2 border rounded" />

            <input
              type="file"
              accept="image/*"
              onChange={e => {
                const file = e.target.files[0]
                if (!file) return
                const reader = new FileReader()
                reader.onloadend = () => {
                  setFreela({ ...freela, foto: reader.result })
                }
                reader.readAsDataURL(file)
              }}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={() => setEditando(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancelar</button>
            <button onClick={salvarAlteracoes} className="bg-green-600 text-white px-4 py-2 rounded">Salvar</button>
          </div>
        </div>
      )}

      {chamado && (
        <div className="mt-6 w-full max-w-md bg-red-100 border-l-8 border-red-600 p-4 rounded-lg shadow-md">
          <div className="flex items-center gap-2 text-red-700 text-lg font-bold mb-2">
            <FaBell className="animate-bounce" /> Você foi chamado!
          </div>
          <p className="text-sm text-red-800">Um estabelecimento solicitou seus serviços. Deseja aceitar?</p>
          <div className="flex justify-center gap-4 mt-4">
            <button onClick={handleAceitar} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition">Aceitar</button>
            <button onClick={handleRecusar} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition">Recusar</button>
          </div>
        </div>
      )}

      {historico.length > 0 && (
        <div className="mt-8 w-full max-w-md bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-3">📋 Histórico de Chamados</h3>
          <ul className="space-y-2 text-sm text-slate-700">
            {historico.map((item, index) => (
              <li key={index} className="border-b pb-2">
                <span className="font-bold">{item.status}</span> em {item.data}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
