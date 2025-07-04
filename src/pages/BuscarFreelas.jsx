import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from '@/components/ProfissionalCard' // ajuste o caminho se precisar
import FiltroForm from '@/components/FiltroForm' // filtro que você mostrou antes

export default function BuscarFreelas() {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  // filtros
  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('')

  useEffect(() => {
    const buscar = async () => {
      setCarregando(true)
      try {
        // Query base para tipo freela
        let q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
        const snapshot = await getDocs(q)
        let resultado = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

        // Aplicar filtros simples no cliente (você pode refinar com queries compostas, mas firebase tem limites)
        if (filtroEspecialidade.trim() !== '') {
          resultado = resultado.filter(f =>
            f.especialidade?.toLowerCase().includes(filtroEspecialidade.toLowerCase())
          )
        }
        if (filtroCidade.trim() !== '') {
          resultado = resultado.filter(f =>
            f.endereco?.toLowerCase().includes(filtroCidade.toLowerCase())
          )
        }
        // filtroDisponibilidade você precisa tratar no seu modelo de dados, aqui não apliquei filtro por falta de info

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
        <p className="text-gray-600">Nenhum freelancer encontrado.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {freelas.map(f => (
            <ProfissionalCard
              key={f.id}
              prof={f}
              distanciaKm={null} // se tiver cálculo de distância, passe aqui
              onChamar={(prof) => alert(`Chamar profissional: ${prof.nome}`)} // substitua pelo seu handler real
            />
          ))}
        </div>
      )}
    </div>
  )
}
