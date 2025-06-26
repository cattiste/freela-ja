import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import ProfissionalCard from '../components/ProfissionalCard'

export default function PainelEstabelecimento() {
  const navigate = useNavigate()
  const [freelas, setFreelas] = useState([])
  const [resultadoFiltro, setResultadoFiltro] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [funcaoFiltro, setFuncaoFiltro] = useState('')
  const [raioBusca, setRaioBusca] = useState('')

  useEffect(() => {
    async function carregarDados() {
      setCarregando(true)
      const usuario = JSON.parse(localStorage.getItem('usuarioLogado'))
      if (!usuario || usuario.tipo !== 'estabelecimento') {
        navigate('/login')
        return
      }

      // Carregar freelas do Firestore
      const snapshot = await getDocs(collection(db, 'usuarios'))
      const lista = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
      const freelasRaw = lista.filter((u) => u.tipo === 'freela')

      setFreelas(freelasRaw)
      setResultadoFiltro(freelasRaw)
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

    // Raio de busca pode ser implementado aqui, se quiser

    setResultadoFiltro(filtrados)
  }

  async function handleChamarProfissional(prof) {
    const estabelecimento = JSON.parse(localStorage.getItem('usuarioLogado'))
    if (!estabelecimento || estabelecimento.tipo !== 'estabelecimento') {
      alert('Você precisa estar logado como estabelecimento para chamar.')
      navigate('/login')
      return
    }

    try {
      await addDoc(collection(db, 'chamadas'), {
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome || 'Estabelecimento desconhecido',
        freelaUid: prof.uid,
        freelaNome: prof.nome,
        criadoEm: serverTimestamp(),
      })

      alert(`✅ Você chamou ${prof.nome}!`)
    } catch (err) {
      console.error('Erro ao chamar profissional:', err)
      alert('Erro ao enviar a chamada. Tente novamente.')
    }
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
                uid: freela.uid,
                imagem: freela.foto || 'https://i.imgur.com/3W8i1sT.png',
                nome: freela.nome,
                especialidade: freela.especialidade || freela.funcao || 'Não informado',
                endereco: freela.endereco || 'Endereço não informado',
                avaliacao: freela.avaliacao || 0,
                descricao: freela.descricao || '',
              }}
              onChamar={() => handleChamarProfissional(freela)}
            />
          ))
        )}
      </div>
    </div>
  )
}
