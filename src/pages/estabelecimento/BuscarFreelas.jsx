import React, { useEffect, useState } from 'react'
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import ProfissionalCard from '../../components/ProfissionalCard'

export default function BuscarFreelas({ estabelecimento }) {
  const [freelas, setFreelas] = useState([])
  const [resultadoFiltro, setResultadoFiltro] = useState([])
  const [funcaoFiltro, setFuncaoFiltro] = useState('')
  const [carregando, setCarregando] = useState(true)

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
        alert('Erro ao carregar freelancers.')
      }
      setCarregando(false)
    }
    carregarDados()
  }, [])

  function aplicarFiltro() {
    let filtrados = freelas
    if (funcaoFiltro.trim()) {
      filtrados = filtrados.filter(
        (f) =>
          f.funcao?.toLowerCase().includes(funcaoFiltro.toLowerCase()) ||
          f.especialidade?.toLowerCase().includes(funcaoFiltro.toLowerCase())
      )
    }
    setResultadoFiltro(filtrados)
  }

  async function handleChamarProfissional(prof) {
    if (!estabelecimento) {
      alert('Você precisa estar logado como estabelecimento para chamar.')
      return
    }

    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: prof.uid,
        freelaNome: prof.nome,
        estabelecimentoUid: estabelecimento.uid,
        estabelecimentoNome: estabelecimento.nome,
        criadoEm: serverTimestamp()
      })
      alert(`✅ Você chamou ${prof.nome}!`)
    } catch (err) {
      console.error('Erro ao chamar profissional:', err)
      alert('Erro ao chamar profissional. Tente novamente.')
    }
  }

  if (carregando) {
    return (
      <div className="min-h-[200px] flex items-center justify-center text-orange-600">
        Carregando freelancers...
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-orange-700 mb-4 text-center">
        🔍 Buscar Freelancers
      </h2>

      <div className="max-w-xl mx-auto bg-white rounded-xl p-5 shadow mb-6">
        <label className="label text-orange-700">Filtrar por função ou especialidade:</label>
        <input
          type="text"
          value={funcaoFiltro}
          onChange={(e) => setFuncaoFiltro(e.target.value)}
          placeholder="Ex: garçom, cozinheiro, churrasqueiro..."
          className="input-field"
        />
        <button
          onClick={aplicarFiltro}
          className="btn-primary w-full mt-3"
        >
          Aplicar Filtro
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {resultadoFiltro.length === 0 ? (
          <p className="text-center text-gray-600 col-span-full">
            Nenhum freelancer encontrado com o filtro aplicado.
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
              onChamar={handleChamarProfissional}
            />
          ))
        )}
      </div>
    </div>
  )
}
