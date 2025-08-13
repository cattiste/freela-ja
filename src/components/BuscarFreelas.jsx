// src/components/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
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
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function BuscarFreelas({ usuario }) {
  const [freelas, setFreelas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFreelas = async () => {
      setLoading(true)
      const snapshot = await getDocs(collection(db, 'usuarios'))
      const statusSnap = await getDocs(collection(db, 'status'))

      const statusMap = {}
      statusSnap.forEach((doc) => {
        statusMap[doc.id] = doc.data().state
      })

      const lista = []

      snapshot.forEach((doc) => {
        const data = doc.data()
        if (data.tipo === 'freela' && data.localizacao) {
          const online = statusMap[doc.id] === 'online'
          const distancia = usuario?.localizacao
            ? calcularDistancia(
                usuario.localizacao.latitude,
                usuario.localizacao.longitude,
                data.localizacao.latitude,
                data.localizacao.longitude
              )
            : null

          lista.push({
            id: doc.id,
            ...data,
            online,
            distancia
          })
        }
      })

      // Ordena por online primeiro, depois por menor distância
      lista.sort((a, b) => {
        if (a.online === b.online) {
          return (a.distancia || 9999) - (b.distancia || 9999)
        }
        return b.online - a.online
      })

      setFreelas(lista)
      setLoading(false)
    }

    if (usuario) fetchFreelas()
  }, [usuario])

  return (
    <div className="p-4 space-y-4">
      {loading && <p className="text-center text-gray-500">Carregando freelas disponíveis...</p>}
      {!loading && freelas.length === 0 && (
        <p className="text-center text-gray-400">Nenhum freelancer disponível no momento.</p>
      )}
      {freelas.map((freela) => (
        <ProfissionalCard key={freela.id} freela={freela} estabelecimento={usuario} />
      ))}
    </div>
  )
}
