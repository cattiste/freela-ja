// src/components/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
  GeoPoint
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import ProfissionalCard from './ProfissionalCard'

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

export default function BuscarFreelas() {
  const { usuario } = useAuth()
  const [freelas, setFreelas] = useState([])
  const [mostrarSomenteOnline, setMostrarSomenteOnline] = useState(true)

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))

    const unsub = onSnapshot(q, async (snap) => {
      const resultados = await Promise.all(
        snap.docs.map(async (docSnap) => {
          const data = docSnap.data()
          const statusSnap = await getDoc(doc(db, 'status', docSnap.id))
          const online = statusSnap.exists() && statusSnap.data().state === 'online'
          const distancia = usuario?.localizacao && data?.localizacao
            ? calcularDistancia(
                usuario.localizacao.latitude,
                usuario.localizacao.longitude,
                data.localizacao.latitude,
                data.localizacao.longitude
              )
            : null
          return {
            id: docSnap.id,
            ...data,
            online,
            distancia
          }
        })
      )

      const filtrados = mostrarSomenteOnline
        ? resultados.filter((f) => f.online)
        : resultados

      filtrados.sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1
        if (a.distancia != null && b.distancia != null) return a.distancia - b.distancia
        return 0
      })

      setFreelas(filtrados)
    })

    return () => unsub()
  }, [usuario?.uid, mostrarSomenteOnline])

  const criarChamada = async (freela) => {
    if (!usuario?.uid || !freela?.id) return

    const agora = new Date()
    const idCustom = `${usuario.uid}_${agora.toISOString().replace(/[-:.]/g, '')}`

    const chamada = {
      estabelecimentoUid: usuario.uid,
      freelaUid: freela.id,
      status: 'pendente',
      criadoEm: serverTimestamp(),
      valor: freela.valorDiaria || 0,
      localizacao: usuario.localizacao || null,
      observacao: '',
    }

    await addDoc(collection(db, 'chamadas'), chamada)
    alert('Chamada enviada! Aguarde a resposta do freela.')
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Buscar Freelas</h1>
      <div className="flex items-center gap-4 mb-4">
        <label>
          <input
            type="checkbox"
            checked={mostrarSomenteOnline}
            onChange={(e) => setMostrarSomenteOnline(e.target.checked)}
          />{' '}
          Mostrar somente online
        </label>
      </div>

      {freelas.map((freela) => (
        <ProfissionalCard
          key={freela.id}
          freela={freela}
          onChamar={() => criarChamada(freela)}
        />
      ))}

      {freelas.length === 0 && (
        <p className="text-gray-500">Nenhum freelancer encontrado.</p>
      )}
    </div>
  )
}
