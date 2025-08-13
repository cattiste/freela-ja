// src/components/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import ProfissionalCard from '@/components/ProfissionalCard'

function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function BuscarFreelas({ usuario }) {
  const [freelas, setFreelas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFreelas = async () => {
      setLoading(true)

      const usuariosSnap = await getDocs(collection(db, 'usuarios'))
      const statusSnap = await getDocs(collection(db, 'status'))

      const statusMap = {}
      statusSnap.forEach((doc) => {
        statusMap[doc.id] = doc.data().state
      })

      const lista = []

      usuariosSnap.forEach((doc) => {
        const data = doc.data()
        const uid = doc.id

        if (data.tipo === 'freela' && data.localizacao) {
          const online = statusMap[uid] === 'online'

          const distancia = usuario?.localizacao
            ? calcularDistancia(
                usuario.localizacao.latitude,
                usuario.localizacao.longitude,
                data.localizacao.latitude,
                data.localizacao.longitude
              )
            : null

          lista.push({
            id: uid,
            ...data,
            online,
            distancia,
          })
        }
      })

      // Freelas online primeiro, depois ordena por distância
      lista.sort((a, b) => {
        if (a.online === b.online) {
          return (a.distancia || 9999) - (b.distancia || 9999)
        }
        return b.online - a.online
      })

      setFreelas(lista)
      setLoading(false)
    }

    if (usuario) {
      fetchFreelas()
    }
  }, [usuario])

  return (
    <div className="p-4 space-y-4">
      {loading && <p className="text-center text-gray-500">Carregando freelancers...</p>}
      {!loading && freelas.length === 0 && (
        <p className="text-center text-gray-400">Nenhum freelancer disponível.</p>
      )}
      {freelas.map((freela) => (
        <ProfissionalCard
          key={freela.id}
          freela={freela}
          estabelecimento={usuario}
          mostrarDistancia
        />
      ))}
    </div>
  )
}
