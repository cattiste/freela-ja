// src/pages/PainelEstabelecimento.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const [freelas, setFreelas] = useState([])
  const [enderecoEstab, setEnderecoEstab] = useState('')
  const [coordenadasEstab, setCoordenadasEstab] = useState(null)
  const [resultadoFiltro, setResultadoFiltro] = useState([])

  useEffect(() => {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const freelancers = usuarios.filter(u => u.tipo === 'freela')
    setFreelas(freelancers)
  }, [])

  const geolocalizarEndereco = async (enderecoTexto) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`)
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
    const R = 6371 // km
    const dLat = toRad(coord2.lat - coord1.lat)
    const dLon = toRad(coord2.lon - coord1.lon)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) *
      Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const filtrarProximos = async () => {
    const coords = await geolocalizarEndereco(enderecoEstab)
    setCoordenadasEstab(coords)
    if (!coords) return alert('Não foi possível localizar o endereço.')

    const filtrados = freelas
      .map(f => ({
        ...f,
        distancia: calcularDistancia(coords, f.coordenadas)
      }))
      .filter(f => f.distancia !== Infinity)
      .sort((a, b) => a.distancia - b.distancia)

    setResultadoFiltro(filtrados)
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">📍 Painel do Estabelecimento</h1>

      <div className="max-w-xl mx-auto mb-6 bg-white rounded-lg p-6 shadow">
        <input
          type="text"
          value={enderecoEstab}
          onChange={(e) => setEnderecoEstab(e.target.value)}
          placeholder="Digite o endereço do seu estabelecimento"
          className="input mb-4"
        />
        <button
          onClick={filtrarProximos}
          className="home-button w-full"
        >
          Buscar Freelancers Próximos
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {resultadoFiltro.length === 0 && (
          <p className="text-gray-500 mb-8">🔎 Nenhum freelancer filtrado ainda.</p>
        )}

        {resultadoFiltro.map((freela, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-4 mb-4 flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <div className="flex items-center gap-4 text-left">
              <img
                src={freela.foto || '/default-avatar.png'}
                alt="freela"
                className="w-16 h-16 rounded-full object-cover border border-orange-300 shadow-sm"
              />
              <div>
                <p className="font-bold text-lg text-gray-800">{freela.nome}</p>
                <p className="text-gray-600">{freela.funcao}</p>
                <p className="text-gray-500 text-sm">{freela.distancia.toFixed(2)} km de distância</p>
              </div>
            </div>
            <button
              onClick={() => {
                localStorage.setItem('freelaChamado', freela.nome)
                alert(`✅ Você chamou ${freela.nome}!`)
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition"
            >
              Chamar
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-10 bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded"
      >
        Voltar
      </button>
    </div>
  )
}
