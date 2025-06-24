import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const [freelas, setFreelas] = useState([])
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [coordenadasEstab, setCoordenadasEstab] = useState(null)
  const [resultadoFiltro, setResultadoFiltro] = useState([])
  const [filtroFuncao, setFiltroFuncao] = useState('')

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')

    if (!usuario || usuario.tipo !== 'estabelecimento') {
      navigate('/login')
      return
    }

    const dadosEstab = usuarios.find(u => u.uid === usuario.uid)
    const freelancers = usuarios.filter(u => u.tipo === 'freela')

    setEstabelecimento(dadosEstab)
    setFreelas(freelancers)

    if (dadosEstab?.coordenadas) {
      setCoordenadasEstab(dadosEstab.coordenadas)
    } else {
      geolocalizarEndereco(dadosEstab?.endereco).then(coords => {
        setCoordenadasEstab(coords)
      })
    }
  }, [navigate])

  useEffect(() => {
    if (coordenadasEstab) {
      const filtrados = freelas
        .map(f => {
          const distancia = f.coordenadas ? calcularDistancia(coordenadasEstab, f.coordenadas) : Infinity
          return { ...f, distancia }
        })
        .filter(f => f.distancia <= 7)
        .sort((a, b) => a.distancia - b.distancia)

      setResultadoFiltro(filtrados)
    }
  }, [coordenadasEstab, freelas])

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`
      )
      const data = await response.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (error) {
      console.error("Erro ao geolocalizar endereço:", error)
    }
    return null
  }

  const calcularDistancia = (coord1, coord2) => {
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

  const freelancersFiltrados = resultadoFiltro.filter(f =>
    filtroFuncao === '' || f.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-orange-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-4">📍 Painel do Estabelecimento</h1>

      <button
        onClick={() => navigate(`/perfil/${estabelecimento?.uid}`)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded mb-4"
      >
        ✏️ Editar Perfil
      </button>

      <div className="max-w-xl mx-auto mb-6 bg-white rounded-lg p-6 shadow">
        <input
          type="text"
          placeholder="Filtrar por função (ex: Garçom, Chapeiro...)"
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="input"
        />
      </div>

      <div className="max-w-4xl mx-auto">
        {freelancersFiltrados.length === 0 && (
          <p className="text-gray-500 mb-8">🔍 Nenhum freelancer próximo encontrado no raio de 7km.</p>
        )}

        {freelancersFiltrados.map((freela, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="flex items-center gap-4 text-left">
              <img
                src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                alt="freela"
                className="w-16 h-16 rounded-full object-cover border border-orange-300 shadow-sm"
              />
              <div>
                <p className="font-bold text-lg text-gray-800">{freela.nome}</p>
                <p className="text-gray-600">{freela.funcao}</p>
                <p className="text-gray-500 text-sm">
                  {freela.distancia?.toFixed(2)} km de distância
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                const chamada = {
                  freela: freela.nome,
                  estabelecimento: estabelecimento?.nome || 'Estabelecimento desconhecido',
                  horario: new Date().toISOString()
                }
                localStorage.setItem('chamadaFreela', JSON.stringify(chamada))
                alert(`✅ Você chamou ${freela.nome}!`)
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Chamar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
