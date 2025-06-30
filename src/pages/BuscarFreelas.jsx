import React, { useEffect, useState } from 'react'
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from '@/components/ProfissionalCard'
import haversine from 'haversine-distance'

export default function BuscarFreelas({ estabelecimento }) {
  const [freelas, setFreelas] = useState([])
  const [resultadoFiltro, setResultadoFiltro] = useState([])
  const [funcaoFiltro, setFuncaoFiltro] = useState('')
  const [cidadeFiltro, setCidadeFiltro] = useState('')
  const [raioFiltro, setRaioFiltro] = useState(10)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  useEffect(() => {
    setCarregando(true)
    const unsubscribe = onSnapshot(collection(db, 'usuarios'), (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }))
      // Só os freelas online
      const freelasOnline = lista.filter(u => u.tipo === 'freela' && u.status === 'online')

      setFreelas(freelasOnline)
      setCarregando(false)
    }, (err) => {
      console.error('Erro ao escutar freelancers:', err)
      setErro('Erro ao carregar freelancers.')
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setResultadoFiltro(filtrar(freelas, funcaoFiltro, cidadeFiltro, raioFiltro))
    }, 300)
    return () => clearTimeout(timer)
  }, [funcaoFiltro, cidadeFiltro, raioFiltro, freelas])

  function filtrar(lista, funcao, cidade, raioKm) {
    if (!estabelecimento?.localizacao) {
      // Se não temos localização do estabelecimento, filtra só por função e cidade
      return lista.filter(f => {
        const matchFuncao =
          !funcao ||
          f.funcao?.toLowerCase().includes(funcao.toLowerCase()) ||
          f.especialidade?.toLowerCase().includes(funcao.toLowerCase())

        const matchCidade =
          !cidade ||
          f.endereco?.toLowerCase().includes(cidade.toLowerCase())

        return matchFuncao && matchCidade
      })
    }

    return lista.filter((f) => {
      const matchFuncao =
        !funcao ||
        f.funcao?.toLowerCase().includes(funcao.toLowerCase()) ||
        f.especialidade?.toLowerCase().includes(funcao.toLowerCase())

      const matchCidade =
        !cidade ||
        f.endereco?.toLowerCase().includes(cidade.toLowerCase())

      // Calcula distância só se freela e estabelecimento tem coordenadas
      if (
        !f.localizacao?.latitude ||
        !f.localizacao?.longitude
      ) {
        // Sem coordenadas do freela, não inclui na lista (ou mude conforme sua regra)
        return false
      }

      const dist = haversine(
        {
          lat: estabelecimento.localizacao.latitude,
          lng: estabelecimento.localizacao.longitude,
        },
        {
          lat: f.localizacao.latitude,
          lng: f.localizacao.longitude,
        }
      ) / 1000 // de metros para km

      const matchDistancia = dist <= raioKm

      return matchFuncao && matchCidade && matchDistancia
    })
  }

  async function handleChamarProfissional(prof) {
    if (!estabelecimento) {
      setErro('Você precisa estar logado como estabelecimento para chamar.')
      return
    }

    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: prof.uid,
        freelaNome: prof.nome,
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome,
        criadoEm: serverTimestamp(),
        status: 'pendente',
      })
      setSucesso(`Você chamou ${prof.nome}!`)
      setTimeout(() => setSucesso(null), 5000)
    } catch (err) {
      console.error('Erro ao chamar profissional:', err)
      setErro('Erro ao chamar profissional. Tente novamente.')
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {erro && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
          {erro}
          <button onClick={() => setErro(null)} className="float-right font-bold">✕</button>
        </div>
      )}

      {sucesso && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
          {sucesso}
          <button onClick={() => setSucesso(null)} className="float-right font-bold">✕</button>
        </div>
      )}

      <h2 className="text-2xl font-bold text-orange-700 mb-6 text-center">
        🔍 Buscar Freelancers Online
      </h2>

      <div className="max-w-2xl mx-auto bg-white rounded-xl p-5 shadow-lg mb-8 space-y-4">
        <div>
          <label className="block text-orange-700 font-medium mb-2">Filtrar por função:</label>
          <input
            type="text"
            value={funcaoFiltro}
            onChange={(e) => setFuncaoFiltro(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Garçom, cozinheiro..."
          />
        </div>

        <div>
          <label className="block text-orange-700 font-medium mb-2">Filtrar por cidade:</label>
          <input
            type="text"
            value={cidadeFiltro}
            onChange={(e) => setCidadeFiltro(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="São Paulo, Zona Sul..."
          />
        </div>

        <div>
          <label className="block text-orange-700 font-medium mb-2">Distância máxima (km):</label>
          <select
            value={raioFiltro}
            onChange={(e) => setRaioFiltro(parseInt(e.target.value))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            {[5, 10, 20, 50, 100].map((km) => (
              <option key={km} value={km}>{km} km</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resultadoFiltro.length === 0 ? (
          <div className="col-span-full text-center py-10 text-gray-600">
            Nenhum freelancer encontrado com os filtros aplicados.
          </div>
        ) : (
          resultadoFiltro.map((freela) => (
            <ProfissionalCard
              key={freela.uid}
              prof={{
                ...freela,
                imagem: freela.foto || '/default-avatar.png',
                especialidade: freela.especialidade || freela.funcao || 'Não informado',
                endereco: freela.endereco || 'Endereço não informado',
              }}
              onChamar={() => handleChamarProfissional(freela)}
            />
          ))
        )}
      </div>
    </div>
  )
}
