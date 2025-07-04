import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from '@/components/ProfissionalCard'
import FiltroForm from '@/components/FiltroForm'

export default function BuscarFreelas() {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('')

  useEffect(() => {
    const buscar = async () => {
      setCarregando(true)
      try {
        // Consulta inicial: tipo 'freela'
        let q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
        const snapshot = await getDocs(q)
        let resultado = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Filtragem simples no cliente (refine se possível no servidor)
        if (filtroEspecialidade.trim()) {
          resultado = resultado.filter(f =>
            f.especialidade?.toLowerCase().includes(filtroEspecialidade.toLowerCase())
          )
        }
        if (filtroCidade.trim()) {
          resultado = resultado.filter(f =>
            f.endereco?.toLowerCase().includes(filtroCidade.toLowerCase())
          )
        }

        // TODO: filtroDisponibilidade - implemente conforme seu modelo de dados

        setFreelas(resultado)
        setErro(null)
      } catch (err) {
        console.error('Erro ao buscar freelas:', err)
        setErro('Erro ao buscar freelancers.')
      } finally {
        setCarregando(false)
      }
    }

    buscar()
  }, [filtroEspecialidade, filtroCidade, filtroDisponibilidade])

  if (carregando) return <div className="p-4">🔄 Carregando freelancers...</div>
  if (erro) return <div className="p-4 text-red-500">{erro}</div>

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold text-orange-700 mb-4">🔍 Freelancers</h2>

      <FiltroForm
        filtroEspecialidade={filtroEspecialidade}
        setFiltroEspecialidade={setFiltroEspecialidade}
        filtroCidade={filtroCidade}
        setFiltroCidade={setFiltroCidade}
        filtroDisponibilidade={filtroDisponibilidade}
        setFiltroDisponibilidade={setFiltroDisponibilidade}
      />

      {freelas.length === 0 ? (
        <p className="text-gray-600 mt-4">Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {freelas.map(f => (
            <ProfissionalCard
              key={f.id}
              prof={f}
              distanciaKm={null} // implemente cálculo se quiser filtrar por distância
              onChamar={(prof) => {
                // AQUI substitua pelo seu handler real para chamar o freela
                alert(`Chamar profissional: ${prof.nome}`)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
