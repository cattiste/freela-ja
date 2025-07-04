import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from '@/components/ProfissionalCard'
import FiltroForm from './FiltroForm'

export default function BuscarFreelas() {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  const [filtroEspecialidade, setFiltroEspecialidade] = useState('')
  const [filtroCidade, setFiltroCidade] = useState('')
  const [filtroDisponibilidade, setFiltroDisponibilidade] = useState('')

  useEffect(() => {
    const buscar = async () => {
      try {
        const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
        const snapshot = await getDocs(q)
        const resultado = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setFreelas(resultado)
      } catch (err) {
        console.error('Erro ao buscar freelas:', err)
        setErro('Erro ao buscar freelas.')
      } finally {
        setCarregando(false)
      }
    }

    buscar()
  }, [])

  const aplicarFiltros = (freela) => {
    const especialidadeOk = filtroEspecialidade
      ? freela.funcao?.toLowerCase().includes(filtroEspecialidade.toLowerCase())
      : true
    const cidadeOk = filtroCidade
      ? freela.endereco?.toLowerCase().includes(filtroCidade.toLowerCase())
      : true

    // Filtro de disponibilidade pode ser ajustado com base na agenda do freela futuramente
    return especialidadeOk && cidadeOk
  }

  const filtrados = freelas.filter(f => f.nome && f.funcao && aplicarFiltros(f))

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">🔍 Freelancers</h2>

      <FiltroForm
        filtroEspecialidade={filtroEspecialidade}
        setFiltroEspecialidade={setFiltroEspecialidade}
        filtroCidade={filtroCidade}
        setFiltroCidade={setFiltroCidade}
        filtroDisponibilidade={filtroDisponibilidade}
        setFiltroDisponibilidade={setFiltroDisponibilidade}
      />

      {carregando && <p className="text-gray-600">Carregando freelancers...</p>}
      {erro && <p className="text-red-500">{erro}</p>}

      {filtrados.length === 0 ? (
        <p className="text-gray-500">Nenhum freelancer encontrado com os filtros atuais.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtrados.map(f => (
            <ProfissionalCard key={f.id} prof={f} />
          ))}
        </div>
      )}
    </div>
  )
}
