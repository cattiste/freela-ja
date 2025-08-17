// src/components/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from './ProfissionalCard'

export default function BuscarFreelas({ contratante }) {
  const [freelas, setFreelas] = useState([])
  const [statusOnline, setStatusOnline] = useState({})
  const [filtro, setFiltro] = useState('todos')
  const [filtroFuncao, setFiltroFuncao] = useState('')

  useEffect(() => {
    const fetchFreelas = async () => {
      const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
      const querySnapshot = await getDocs(q)
      const lista = []

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data()
        const uid = docSnap.id
        data.id = uid

        // Buscar status online do Firestore
        try {
          const statusRef = doc(db, 'status', uid)
          const statusSnap = await getDoc(statusRef)
          const online = statusSnap.exists() && statusSnap.data().state === 'online'
          setStatusOnline((prev) => ({ ...prev, [uid]: online }))
        } catch (err) {
          console.error('Erro ao buscar status online:', err)
        }

        lista.push(data)
      }

      setFreelas(lista)
    }

    fetchFreelas()
  }, [])

  const aplicarFiltros = () => {
    return freelas.filter((freela) => {
      const online = statusOnline[freela.id] === true
      const offline = statusOnline[freela.id] === false

      if (filtro === 'online' && !online) return false
      if (filtro === 'offline' && !offline) return false

      if (filtroFuncao && !freela.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())) return false

      return true
    })
  }

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Buscar por função..."
        value={filtroFuncao}
        onChange={(e) => setFiltroFuncao(e.target.value)}
        className="w-full p-2 mb-4 rounded border"
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-4 py-2 rounded ${filtro === 'todos' ? 'bg-orange-500 text-white' : 'bg-gray-200'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setFiltro('online')}
          className={`px-4 py-2 rounded ${filtro === 'online' ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
        >
          Online
        </button>
        <button
          onClick={() => setFiltro('offline')}
          className={`px-4 py-2 rounded ${filtro === 'offline' ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
        >
          Offline
        </button>
      </div>

      {aplicarFiltros().map((freela) => (
        <ProfissionalCard
          key={freela.id}
          freela={freela}
          contratante={contratante}
          isOnline={statusOnline[freela.id]}
        />
      ))}

      {aplicarFiltros().length === 0 && (
        <p className="text-center text-gray-500 mt-8">Nenhum freelancer encontrado.</p>
      )}
    </div>
  )
}
