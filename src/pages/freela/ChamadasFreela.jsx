// src/pages/freela/ChamadasFreela.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  GeoPoint,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(collection(db, 'chamadas'), where('freelaUid', '==', usuario.uid))
    const unsub = onSnapshot(q, (snap) => {
      const lista = []
      snap.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() })
      })
      setChamadas(lista)
    })
    return unsub
  }, [usuario?.uid])

  const handleAcao = async (id, campo) => {
    await updateDoc(doc(db, 'chamadas', id), {
      [campo]: true,
      atualizadoEm: serverTimestamp(),
    })
  }

  const handleRejeitar = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'rejeitada',
      atualizadoEm: serverTimestamp(),
    })
  }

  const aceitarChamada = async (chamada) => {
    await updateDoc(doc(db, 'chamadas', chamada.id), {
      status: 'aceita',
      atualizadoEm: serverTimestamp(),
    })
  }

  const verificarPresenca = async (chamada) => {
    try {
      const docEstab = await getDoc(doc(db, 'usuarios', chamada.chamadorUid))
      const localEstab = docEstab.data()?.coordenadas

      if (!localEstab || !navigator.geolocation) return false

      return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords
          const distancia = calcularDistancia(
            latitude,
            longitude,
            localEstab.latitude,
            localEstab.longitude
          )
          resolve(distancia <= 0.015) // ~15 metros
        }, () => resolve(false))
      })
    } catch {
      return false
    }
  }

  const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <div className="p-4">
      <h1 className="text-lg font-bold mb-4 text-white">Chamadas Recebidas</h1>
      {chamadas.length === 0 && <p className="text-white">Nenhuma chamada.</p>}
      {chamadas.map((ch) => {
        const {
          id,
          chamadorNome,
          status,
          statusCheckinFreela,
          statusCheckinEstab,
          statusCheckoutFreela,
          statusCheckoutEstab,
          observacao,
        } = ch

        const podeAceitar = status === 'pendente'
        const podeFazerCheckin =
          status === 'aceita' && !statusCheckinFreela
        const podeFazerCheckout =
          statusCheckinFreela && statusCheckinEstab && !statusCheckoutFreela

        return (
          <div key={id} className="bg-white rounded-xl p-4 mb-4 shadow">
            <p className="text-orange-700 font-bold text-lg">📍 {chamadorNome}</p>
            {observacao && <p className="text-sm text-gray-600 italic">{observacao}</p>}

            <div className="mt-2 space-x-2">
              {podeAceitar && (
                <>
                  <button
                    onClick={() => aceitarChamada(ch)}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    Aceitar chamada
                  </button>
                  <button
                    onClick={() => handleRejeitar(id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Rejeitar
                  </button>
                </>
              )}

              {podeFazerCheckin && (
                <button
                  onClick={async () => {
                    const presente = await verificarPresenca(ch)
                    if (presente) {
                      handleAcao(id, 'statusCheckinFreela')
                    } else {
                      toast.error('Você precisa estar no local para fazer o check-in.')
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Fazer check-in
                </button>
              )}

              {podeFazerCheckout && (
                <button
                  onClick={() => handleAcao(id, 'statusCheckoutFreela')}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Fazer check-out
                </button>
              )}

              {!podeAceitar && !podeFazerCheckin && !podeFazerCheckout && (
                <p className="text-sm text-gray-500 mt-2">Aguardando o contratante...</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
