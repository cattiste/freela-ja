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
  const [funcaoFiltro, setFuncaoFiltro] = useState('')

  useEffect(() => {
    const carregarDados = async () => {
      const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
      if (!usuario || usuario.tipo !== 'estabelecimento') {
        navigate('/login')
        return
      }

      // Busca todos usuários no Firestore
      const snapshot = await getDocs(collection(db, 'usuarios'))
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Filtra apenas freelas
      const freelas = lista.filter(u => u.tipo === 'freela')
      
      // Encontra o estabelecimento logado para pegar o endereço
      const estabelecimento = lista.find(u => u.uid === usuario.uid)

      if (estabelecimento?.endereco) {
        const coords = await geolocalizarEndereco(estabelecimento.endereco)
        if (coords) {
          setCoordenadasEstab(coords)

          // Para cada freela calcula a distância do estabelecimento (se tiver endereço)
          const freelasComDistancia = freelas.map(f => {
            const distancia = f.endereco
              ? calcularDistancia(coords, f.endereco)
              : Infinity
            return { ...f, distancia }
          })

          // Filtra freelas que estejam até 7km de distância e ordena por distância
          const filtrados = freelasComDistancia
            .filter(f => f.distancia <= 7)
            .sort((a, b) => a.distancia - b.distancia)

          setFreelas(filtrados)
          setResultadoFiltro(filtrados)
        } else {
          // Sem coordenadas, mostra todos freelas sem distância
          setFreelas(freelas)
          setResultadoFiltro(freelas)
        }
      } else {
        // Se estabelecimento não tem endereço, mostra freelas sem distância
        setFreelas(freelas)
        setResultadoFiltro(freelas)
      }
    }

    carregarDados()import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import ProfissionalCard from '../components/ProfissionalCard'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const [freelas, setFreelas] = useState([])
  const [resultadoFiltro, setResultadoFiltro] = useState([])
  const [coordenadasEstab, setCoordenadasEstab] = useState(null)
  const [raioBusca, setRaioBusca] = useState('') // em km (string para input)
  const [funcaoFiltro, setFuncaoFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)

  // Função para geolocalizar endereço e pegar lat/lon
  async function geolocalizarEndereco(enderecoTexto) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(enderecoTexto)}`)
      const data = await res.json()
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) }
      }
    } catch (err) {
      console.error('Erro ao geolocalizar:', err)
    }
    return null
  }

  // Calcula distância entre duas coordenadas em km usando fórmula Haversine
  function calcularDistancia(coord1, coord2) {
    if (!coord1 || !coord2) return Infinity

    const toRad = deg => deg * Math.PI / 180
    const R = 6371 // Raio da Terra em km

    const dLat = toRad(coord2.lat - coord1.lat)
    const dLon = toRad(coord2.lon - coord1.lon)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)

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

      // Geolocaliza o estabelecimento
      const coordsEstab = usuario.endereco ? await geolocalizarEndereco(usuario.endereco) : null
      setCoordenadasEstab(coordsEstab)

      // Pega todos os usuários freelas
      const snapshot = await getDocs(collection(db, 'usuarios'))
      const lista = snapshot.docs.map(doc => doc.data())
      const freelasRaw = lista.filter(u => u.tipo === 'freela')

      // Para cada freela, geolocaliza endereço e calcula distância
      const freelasComDistancia = await Promise.all(freelasRaw.map(async (freela) => {
        const coordsFreela = freela.endereco ? await geolocalizarEndereco(freela.endereco) : null
        const distancia = (coordsEstab && coordsFreela) ? calcularDistancia(coordsEstab, coordsFreela) : Infinity
        return { ...freela, distancia }
      }))

      setFreelas(freelasComDistancia)
      setResultadoFiltro(freelasComDistancia)
      setCarregando(false)
    }

    carregarDados()
  }, [navigate])

  // Filtrar freelas por função e raio de busca
  function aplicarFiltro() {
    let filtrados = freelas

    if (funcaoFiltro.trim()) {
      filtrados = filtrados.filter(f =>
        f.funcao?.toLowerCase().includes(funcaoFiltro.toLowerCase()) ||
        f.especialidade?.toLowerCase().includes(funcaoFiltro.toLowerCase())
      )
    }

    if (raioBusca.trim()) {
      const raioKm = parseFloat(raioBusca)
      if (!isNaN(raioKm)) {
        filtrados = filtrados.filter(f => f.distancia <= raioKm)
      }
    }

    setResultadoFiltro(filtrados)
  }

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center">Carregando freelas...</div>
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-4">📍 Painel do Estabelecimento</h1>

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

      <div className="max-w-xl mx-auto bg-white rounded-lg p-4 shadow mb-6 text-left">
        <label className="block mb-2 font-semibold text-orange-600">Filtrar por função (ex: cozinheiro):</label>
        <input
          type="text"
          value={funcaoFiltro}
          onChange={e => setFuncaoFiltro(e.target.value)}
          placeholder="Digite a função ou especialidade"
          className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />

        <label className="block mb-2 font-semibold text-orange-600">Raio de busca (km) - deixe vazio para buscar sem filtro:</label>
        <input
          type="number"
          min="0"
          step="0.1"
          value={raioBusca}
          onChange={e => setRaioBusca(e.target.value)}
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

      {/* Lista de freelas */}
      <div className="max-w-6xl mx-auto flex flex-wrap justify-center">
        {resultadoFiltro.length === 0 ? (
          <p className="text-gray-500">🔎 Nenhum freelancer encontrado com os filtros aplicados.</p>
        ) : (
          resultadoFiltro.map((freela, idx) => (
            <ProfissionalCard
              key={freela.uid || idx}
              prof={{
                imagem: freela.foto || 'https://i.imgur.com/3W8i1sT.png',
                nome: freela.nome,
                especialidade: freela.especialidade || freela.funcao || 'Não informado',
                cidade: freela.cidade || 'Cidade não informada',
                avaliacao: freela.avaliacao || 0,
                descricao: freela.descricao || '',
              }}
            />
          ))
        )}
      </div>
    </div>
  )
}

  }, [navigate])

  // Função para geocodificar endereço usando OpenStreetMap
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

  // Calcula distância em km entre coordenadas (usando fórmula de Haversine)
  const calcularDistancia = (coord1, endereco2) => {
    // Para calcular a distância precisamos das lat/lon de ambos
    // Como o freela tem endereço em string, aqui assumo que tem lat/lon em freela.lat e freela.lon
    // Se não tiver, retorna Infinity (distância muito grande)
    if (!coord1 || !endereco2?.lat || !endereco2?.lon) return Infinity

    const toRad = deg => deg * Math.PI / 180
    const R = 6371 // Raio da Terra em km
    const dLat = toRad(endereco2.lat - coord1.lat)
    const dLon = toRad(endereco2.lon - coord1.lon)
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(coord1.lat)) * Math.cos(toRad(endereco2.lat)) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Filtra freelas por função/especialidade digitada
  const aplicarFiltroFuncao = () => {
    if (!funcaoFiltro) {
      setResultadoFiltro(freelas)
    } else {
      setResultadoFiltro(freelas.filter(f => (f.funcao || f.especialidade || '').toLowerCase().includes(funcaoFiltro.toLowerCase())))
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6 text-center">
      <h1 className="text-3xl font-bold text-orange-700 mb-6">📍 Painel do Estabelecimento</h1>

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

      <div className="max-w-xl mx-auto bg-white rounded-lg p-4 shadow mb-6">
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

      <div className="max-w-6xl mx-auto flex flex-wrap justify-center">
        {resultadoFiltro.length === 0 ? (
          <p className="text-gray-500">🔎 Nenhum freelancer encontrado na área de 7km.</p>
        ) : (
          resultadoFiltro.map(freela => (
            <ProfissionalCard
              key={freela.uid || freela.id}
              prof={freela}
              // Você pode adicionar props extras, ex: onClick no botão Chamar, se quiser
            />
          ))
        )}
      </div>
    </div>
  )
}
