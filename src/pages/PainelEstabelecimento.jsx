import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

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

  const chamarFreela = (freela) => {
    const estabelecimento = JSON.parse(localStorage.getItem('usuarioLogado'))
    const chamada = {
      freela: freela.nome,
      estabelecimento: estabelecimento?.nome || 'Estabelecimento desconhecido',
      horario: new Date().toISOString()
    }
    localStorage.setItem('chamadaFreela', JSON.stringify(chamada))
    alert(`✅ Você chamou ${freela.nome}!`)
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">📍 Painel do Estabelecimento</h1>

      {/* Botões principais */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button
          onClick={() => navigate('/novavaga')}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded shadow"
        >
          📢 Nova Vaga
        </button>
        <button
          onClick={() => navigate('/perfil/estabelecimento')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded shadow"
        >
          ✏️ Editar Perfil
        </button>
      </div>

      {/* Filtro por função */}
      <div className="max-w-xl mx-auto bg-white rounded-lg p-4 shadow mb-8">
        <input
          type="text"
          value={funcaoFiltro}
          onChange={(e) => setFuncaoFiltro(e.target.value)}
          placeholder="Filtrar por função (ex: cozinheiro)"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button
          onClick={aplicarFiltroFuncao}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition"
        >
          Filtrar
        </button>
      </div>

      {/* Listagem de freelancers em cards bonitos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {resultadoFiltro.length === 0 ? (
          <p className="text-gray-500 col-span-full">🔎 Nenhum freelancer encontrado na área de 7km.</p>
        ) : (
          resultadoFiltro.map((freela, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center transition hover:shadow-lg"
            >
              <img
                src={freela.foto || 'https://i.imgur.com/3W8i1sT.png'}
                alt="freela"
                className="w-24 h-24 rounded-full object-cover mb-4 border-4 border-orange-100"
              />
              <h3 className="text-xl font-bold text-orange-700">{freela.nome}</h3>
              <p className="text-gray-600 mb-1">{freela.funcao}</p>
              <p className="text-sm text-gray-500 mb-4">
                📍 {freela.distancia?.toFixed(2)} km de distância
              </p>
              <button
                onClick={() => chamarFreela(freela)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition"
              >
                Chamar
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
