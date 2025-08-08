// 📄 src/pages/[...]/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from '@/components/ProfissionalCard'
import { toast } from 'react-hot-toast'
import { haversineDistance } from '@/utils/haversine'

export default function BuscarFreelas({ usuario, usuariosOnline }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario?.localizacao) return

    const buscarFreelas = async () => {
      setCarregando(true)
      try {
        const ref = collection(db, 'usuarios')
        const q = query(ref, where('tipo', '==', 'freela'))
        const snap = await getDocs(q)

        const resultados = []

        snap.forEach((doc) => {
          const freela = doc.data()
          const uid = doc.id

          // Verifica se está online
          const online = usuariosOnline?.[uid]?.online
          if (!freela.localizacao) return

          // Calcula distância
          const distancia = haversineDistance(
            usuario.localizacao,
            freela.localizacao
          )

          resultados.push({
            ...freela,
            id: uid,
            online,
            distancia
          })
        })

        // Ordena: online primeiro, depois por distância
        resultados.sort((a, b) => {
          if (a.online && !b.online) return -1
          if (!a.online && b.online) return 1
          return a.distancia - b.distancia
        })

        setFreelas(resultados)
      } catch (error) {
        console.error('Erro ao buscar freelas:', error)
        toast.error('Erro ao buscar freelancers')
      } finally {
        setCarregando(false)
      }
    }

    buscarFreelas()
  }, [usuario, usuariosOnline])

  if (carregando) {
    return <p className="text-center mt-4">Carregando freelancers...</p>
  }

  if (freelas.length === 0) {
    return <p className="text-center mt-4">Nenhum freelancer disponível no momento.</p>
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {freelas.map((freela) => (
        <ProfissionalCard
          key={freela.id}
          freela={freela}
          usuario={usuario}
          distancia={freela.distancia}
          online={freela.online}
        />
      ))}
    </div>
  )
}
