<<<<<<< HEAD
// src/pages/PainelEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import './Home.css'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const [freelas, setFreelas] = useState([])
  const [resultadoFiltro, setResultadoFiltro] = useState([])
  const [coordenadasEstab, setCoordenadasEstab] = useState(null)
  const [funcaoFiltro, setFuncaoFiltro] = useState('')

  useEffect(() => {
    const carregarDados = async () => {
      const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
      if (!usuario || usuario.tipo !== 'estabelecimento') {
        navigate('/login')
        return
      }

      const snapshot = await getDocs(collection(db, 'usuarios'))
      const lista = snapshot.docs.map(doc => doc.data())
      const freelas = lista.filter(u => u.tipo === 'freela')
      const estabelecimento = lista.find(u => u.uid === usuario.uid)

      if (estabelecimento?.endereco) {
        const coords = await geolocalizarEndereco(estabelecimento.endereco)
        if (coords) {
          setCoordenadasEstab(coords)
          const filtrados = freelas
            .map(f => ({
              ...f,
              distancia: f.endereco ? calcularDistancia(coords, f.endereco) : Infinity
            }))
            .filter(f => f.distancia <= 7)
            .sort((a, b) => a.distancia - b.distancia)

          setFreelas(filtrados)
          setResultadoFiltro(filtrados)
        }
      }
    }

    carregarDados()
  }, [navigate])

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`)
      const data = await res.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (err) {
      console.error("Erro ao geolocalizar:", err)
    }
    return null
  }

  const calcularDistancia = (coord1, endereco2) => {
    const coord2 = coord1 && endereco2 ? coord1 : null
    if (!coord1 || !coord2) return Infinity
    const toRad = deg => deg * Math.PI / 180
    const R = 6371
    const dLat = toRad(coord2.lat - coord1.lat)
    const dLon = toRad(coord2.lon - coord1.lon)
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const aplicarFiltroFuncao = () => {
    if (!funcaoFiltro) {
      setResultadoFiltro(freelas)
    } else {
      setResultadoFiltro(freelas.filter(f => f.funcao?.toLowerCase().includes(funcaoFiltro.toLowerCase())))
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-4">📍 Painel do Estabelecimento</h1>

      <div className="max-w-xl mx-auto bg-white rounded-lg p-4 shadow mb-6">
        <input
          type="text"
          value={funcaoFiltro}
          onChange={(e) => setFuncaoFiltro(e.target.value)}
          placeholder="Filtrar por função (ex: cozinheiro)"
          className="input mb-4"
        />
        <button onClick={aplicarFiltroFuncao} className="home-button w-full">Filtrar</button>
      </div>

      <button onClick={() => navigate('/perfil/estabelecimento')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-4">
        Editar Perfil
      </button>

      <div className="max-w-4xl mx-auto">
        {resultadoFiltro.length === 0 && (
          <p className="text-gray-500">🔎 Nenhum freelancer encontrado na área de 7km.</p>
        )}

        {resultadoFiltro.map((freela, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-left">
              <img src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'} alt="freela" className="w-16 h-16 rounded-full object-cover" />
              <div>
                <p className="font-bold text-lg">{freela.nome}</p>
                <p>{freela.funcao}</p>
                <p className="text-sm text-gray-500">{freela.distancia?.toFixed(2)} km de distância</p>
              </div>
            </div>
            <button
              onClick={() => {
                const estabelecimento = JSON.parse(localStorage.getItem('usuarioLogado'))
                const chamada = {
                  freela: freela.nome,
                  estabelecimento: estabelecimento?.nome || 'Estabelecimento desconhecido',
                  horario: new Date().toISOString()
                }
                localStorage.setItem('chamadaFreela', JSON.stringify(chamada))
                alert(`✅ Você chamou ${freela.nome}!`)
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
            >
              Chamar
            </button>
          </div>
        ))}
=======
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

import BuscarFreelas from './BuscarFreelas'
import ChamadasEstabelecimento from './ChamadasEstabelecimento'
import AgendasContratadas from './AgendasContratadas'
import AvaliacaoFreela from './AvaliacaoFreela'
import PublicarVaga from './PublicarVaga'
import MinhasVagas from './MinhasVagas'

export default function PainelEstabelecimento() {
  const [aba, setAba] = useState('minhas-vagas')
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [vagaEditando, setVagaEditando] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        try {
          const docRef = doc(db, 'usuarios', user.uid)
          const snap = await getDoc(docRef)

          if (snap.exists() && snap.data().tipo === 'estabelecimento') {
            setEstabelecimento({ uid: user.uid, ...snap.data() })
          } else {
            console.warn('Usuário autenticado não é um estabelecimento.')
          }
        } catch (err) {
          console.error('Erro ao buscar dados do estabelecimento:', err)
        }
      } else {
        console.warn('Nenhum usuário autenticado.')
      }
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  function abrirEdicao(vaga) {
    setVagaEditando(vaga)
    setAba('publicar')
  }

  function onSalvarSucesso() {
    setVagaEditando(null)
    setAba('minhas-vagas')
  }

  const renderConteudo = () => {
    switch (aba) {
      case 'buscar':
        return <BuscarFreelas estabelecimento={estabelecimento} />
      case 'chamadas':
        return <ChamadasEstabelecimento estabelecimento={estabelecimento} />
      case 'agendas':
        return <AgendasContratadas estabelecimento={estabelecimento} />
      case 'avaliacao':
        return <AvaliacaoFreela estabelecimento={estabelecimento} />
      case 'publicar':
        return (
          <PublicarVaga
            estabelecimento={estabelecimento}
            vaga={vagaEditando}
            onSucesso={onSalvarSucesso}
          />
        )
      case 'minhas-vagas':
        return <MinhasVagas estabelecimento={estabelecimento} onEditar={abrirEdicao} />
      default:
        return <BuscarFreelas estabelecimento={estabelecimento} />
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">Carregando painel...</p>
      </div>
    )
  }

  if (!estabelecimento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">Acesso não autorizado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <h1 className="text-3xl font-bold text-orange-700 mb-6">📊 Painel do Estabelecimento</h1>

        {/* Botões das abas */}
        <div className="flex flex-wrap gap-4 mb-6 border-b pb-4">
          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('buscar')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'buscar'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            🔍 Buscar Freelancers
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('chamadas')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'chamadas'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📞 Chamadas
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('agendas')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'agendas'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📅 Agendas
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('avaliacao')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'avaliacao'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            ⭐ Avaliar
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('publicar')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'publicar'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📢 Publicar Vaga
          </button>

          <button
            onClick={() => {
              setVagaEditando(null)
              setAba('minhas-vagas')
            }}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              aba === 'minhas-vagas'
                ? 'bg-orange-600 text-white'
                : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
            }`}
          >
            📋 Minhas Vagas
          </button>
        </div>

        {/* Conteúdo da aba */}
        <div>{renderConteudo()}</div>
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)
      </div>
    </div>
  )
}
