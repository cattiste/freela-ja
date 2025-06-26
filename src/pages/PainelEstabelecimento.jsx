import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import ProfissionalCard from '../components/ProfissionalCard'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const [freelas, setFreelas] = useState([])
  const [resultadoFiltro, setResultadoFiltro] = useState([])
  const [coordenadasEstab, setCoordenadasEstab] = useState(null)
  const [raioBusca, setRaioBusca] = useState('') // km
  const [funcaoFiltro, setFuncaoFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)

  // Geolocalizar endereço para lat/lon
  async function geolocalizarEndereco(enderecoTexto) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          enderecoTexto
        )}`
      )
      const data = await res.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (err) {
      console.error('Erro ao geolocalizar:', err)
    }
    return null
  }

  // Calcular distância entre duas coordenadas (Haversine)
  function calcularDistancia(coord1, coord2) {
    if (!coord1 || !coord2) return Infinity

    const toRad = (deg) => (deg * Math.PI) / 180
    const R = 6371 // km

    const dLat = toRad(coord2.lat - coord1.lat)
    const dLon = toRad(coord2.lon - coord1.lon)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true)

      const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
      if (!usuario || usuario.tipo !== 'estabelecimento') {
        navigate('/login')
        return
      }

      const coordsEstab = usuario.endereco
        ? await geolocalizarEndereco(usuario.endereco)
        : null
      setCoordenadasEstab(coordsEstab)

      const snapshot = await getDocs(collection(db, 'usuarios'))
      const lista = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
      const freelasRaw = lista.filter((u) => u.tipo === 'freela')

      // Geolocalizar freelas e calcular distância
      const freelasComDistancia = await Promise.all(
        freelasRaw.map(async (freela) => {
          const coordsFreela = freela.endereco
            ? await geolocalizarEndereco(freela.endereco)
            : null
          const distancia =
            coordsEstab && coordsFreela
              ? calcularDistancia(coordsEstab, coordsFreela)
              : Infinity
          return { ...freela, distancia }
        })
      )

      setFreelas(freelasComDistancia)
      setResultadoFiltro(freelasComDistancia)
      setCarregando(false)
    }

    carregarDados()
  }, [navigate])

  function aplicarFiltro() {
    let filtrados = freelas

    if (funcaoFiltro.trim()) {
      filtrados = filtrados.filter(
        (f) =>
          (f.funcao?.toLowerCase().includes(funcaoFiltro.toLowerCase()) ||
            f.especialidade?.toLowerCase().includes(funcaoFiltro.toLowerCase()))
      )
    }

    if (raioBusca.trim()) {
      const raioKm = parseFloat(raioBusca)
      if (!isNaN(raioKm)) {
        filtrados = filtrados.filter((f) => f.distancia <= raioKm)
      }
    }

    setResultadoFiltro(filtrados)
  }

  // Função chamada ao clicar em "Chamar"
  function handleChamarProfissional(prof) {
    const estabelecimento = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!estabelecimento) {
      alert('Você precisa estar logado como estabelecimento para chamar.')
      navigate('/login')
      return
    }

    const chamada = {
      freela: prof.nome,
      estabelecimento: estabelecimento.nome || 'Estabelecimento desconhecido',
      horario: new Date().toISOString(),
    }
    localStorage.setItem('chamadaFreela', JSON.stringify(chamada))
    alert(`✅ Você chamou ${prof.nome}!`)
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando freelas...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-4">
        📍 Painel do Estabelecimento
      </h1>

      {/* Botões principais */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
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

      {/* Filtros */}
      <div className="max-w-xl mx-auto bg-white rounded-lg p-4 shadow mb-6 text-left">
        <label className="block mb-2 font-semibold text-orange-600">
          Filtrar por função (ex: cozinheiro):
        </label>
        <input
          type="text"
          value={funcaoFiltro}
          onChange={(e) => setFuncaoFiltro(e.target.value)}
          placeholder="Digite a função ou especialidade"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <label className="block mb-2 font-semibold text-orange-600">
          Raio de busca (km) - deixe vazio para buscar sem filtro:
        </label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={raioBusca}
          onChange={(e) => setRaioBusca(e.target.value)}
          placeholder="Ex: 5"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <button
          onClick={aplicarFiltro}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded transition"
        >
          Aplicar Filtro
        </button>
      </div>

      {/* Lista de profissionais */}
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center">
        {resultadoFiltro.length === 0 ? (
          <p className="text-gray-500">
            🔎 Nenhum freelancer encontrado com os filtros aplicados.
          </p>
        ) : (
          resultadoFiltro.map((freela, idx) => (
            <ProfissionalCard
              key={freela.uid || idx}
              prof={{
                imagem: freela.foto || 'https://i.imgur.com/3W8i1sT.png',
                nome: freela.nome,
                especialidade:
                  freela.especialidade || freela.funcao || 'Não informado',
                endereco: freela.endereco || 'Endereço não informado',
                avaliacao: freela.avaliacao || 0,
                descricao: freela.descricao || '',
              }}
              onChamar={handleChamarProfissional}
            />
          ))
        )}
      </div>
    </div>
  )
}
