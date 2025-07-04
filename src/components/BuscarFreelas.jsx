// src/components/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { criarChamada } from '@/utils/criarChamada'
import ProfissionalCard from './ProfissionalCard'
import { useNavigate } from 'react-router-dom'

export default function BuscarFreelas({ estabelecimento, vaga }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function carregarFreelas() {
      setCarregando(true)
      try {
        const snapshot = await getDocs(collection('usuarios'))
        // Filtra somente freelas (tipo === 'freela')
        const lista = snapshot.docs
          .map(doc => ({ uid: doc.id, ...doc.data() }))
          .filter(u => u.tipo === 'freela')
        setFreelas(lista)
      } catch (err) {
        console.error('Erro ao carregar freelas:', err)
      }
      setCarregando(false)
    }

    carregarFreelas()
  }, [])

  async function handleChamar(freela) {
    if (!estabelecimento) {
      alert('Estabelecimento não definido.')
      return
    }

    try {
      await criarChamada(estabelecimento, freela, vaga)
    } catch (err) {
      console.error('Erro ao criar chamada:', err)
    }
  }

  if (carregando) return <p>Carregando freelancers...</p>
  if (freelas.length === 0) return <p>Nenhum freelancer encontrado.</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {freelas.map(freela => (
        <ProfissionalCard
          key={freela.uid}
          prof={freela}
          onChamar={handleChamar}
        />
      ))}
    </div>
  )
}
