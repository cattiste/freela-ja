import React, { useEffect, useState } from 'react'
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from '@/components/ProfissionalCard'

/**
 * Componente para busca e contratação de freelancers
 * @param {Object} props
 * @param {Object} props.estabelecimento - Dados do estabelecimento logado
 */
export default function BuscarFreelas({ estabelecimento }) {
  const [freelas, setFreelas] = useState([])
  const [resultadoFiltro, setResultadoFiltro] = useState([])
  const [funcaoFiltro, setFuncaoFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [sucesso, setSucesso] = useState(null)

  // Carrega freelancers
  useEffect(() => {
    async function carregarDados() {
      setCarregando(true)
      try {
        const snapshot = await getDocs(collection(db, 'usuarios'))
        const lista = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }))
        const freelasRaw = lista.filter((u) => u.tipo === 'freela')
        setFreelas(freelasRaw)
        setResultadoFiltro(freelasRaw)
      } catch (err) {
        console.error('Erro ao buscar freelancers:', err)
        setErro('Erro ao carregar freelancers.')
      } finally {
        setCarregando(false)
      }
    }
    carregarDados()
  }, [])

  // Aplica filtro automaticamente
  useEffect(() => {
    const timer = setTimeout(() => {
      let filtrados = freelas
      if (funcaoFiltro.trim()) {
        filtrados = freelas.filter(
          (f) =>
            f.funcao?.toLowerCase().includes(funcaoFiltro.toLowerCase()) ||
            f.especialidade?.toLowerCase().includes(funcaoFiltro.toLowerCase())
        )
      }
      setResultadoFiltro(filtrados)
    }, 300)

    return () => clearTimeout(timer)
  }, [funcaoFiltro, freelas])

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
        status: 'pendente'
      })
      setSucesso(`Você chamou ${prof.nome}!`)
      setTimeout(() => setSucesso(null), 5000)
    } catch (err) {
      console.error('Erro ao chamar profissional:', err)
      setErro('Erro ao chamar profissional. Tente novamente.')
    }
  }

  if (carregando) {
    return (
      <div className="min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-600"></div>
      </div>
    )
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
        🔍 Buscar Freelancers
      </h2>

      <div className="max-w-xl mx-auto bg-white rounded-xl p-5 shadow-lg mb-8">
        <label className="block text-orange-700 font-medium mb-2">
          Filtrar por função ou especialidade:
        </label>
        <input
          type="text"
          value={funcaoFiltro}
          onChange={(e) => setFuncaoFiltro(e.target.value)}
          placeholder="Ex: garçom, cozinheiro, churrasqueiro..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resultadoFiltro.length === 0 ? (
          <div className="col-span-full text-center py-10">
            <p className="text-gray-600 text-lg">
              {funcaoFiltro 
                ? 'Nenhum freelancer encontrado com esse filtro'
                : 'Nenhum freelancer disponível no momento'}
            </p>
          </div>
        ) : (
          resultadoFiltro.map((freela) => (
            <ProfissionalCard
              key={freela.uid}
              prof={{
                ...freela,
                imagem: freela.foto || '/default-avatar.png',
                especialidade: freela.especialidade || freela.funcao || 'Não informado',
                ende