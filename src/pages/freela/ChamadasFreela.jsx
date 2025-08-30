import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  GeoPoint,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import RespostasRapidasFreela from '@/components/RespostasRapidasFreela'
import { toast } from 'react-hot-toast'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    if (!usuario) return
    const q = query(collection(db, 'chamadas'), where('freela.id', '==', usuario.uid))
    const unsub = onSnapshot(q, (snap) => {
      const chamadasOrdenadas = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      setChamadas(chamadasOrdenadas)
    })
    return () => unsub()
  }, [usuario])

  const fazerCheckin = async (idChamada) => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não suportada')
      return
    }
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords
      try {
        const chamadaRef = doc(db, 'chamadas', idChamada)
        await updateDoc(chamadaRef, {
          status: 'checkin_freela',
          ultimaLocalizacao: new GeoPoint(latitude, longitude),
          atualizadoEm: serverTimestamp(),
        })
        toast.success('Check-in realizado com sucesso!')
      } catch (err) {
        console.error(err)
        toast.error('Erro ao fazer check-in')
      }
    })
  }

  const finalizarServico = async (idChamada) => {
    try {
      await updateDoc(doc(db, 'chamadas', idChamada), {
        status: 'checkout_freela',
        atualizadoEm: serverTimestamp(),
      })
      toast.success('Check-out enviado com sucesso')
    } catch (e) {
      toast.error('Erro ao finalizar serviço')
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-orange-600">📲 Chamadas Recebidas</h1>
      {chamadas.length === 0 && <p>Nenhuma chamada recebida ainda.</p>}
      {chamadas.map((chamada) => (
        <div key={chamada.id} className="border border-orange-200 rounded p-3 bg-white">
          <p className="text-orange-600 font-bold">Chamada <span className="text-black">#{chamada.id.slice(-5)}</span></p>
          <p><span className="font-bold">Status:</span> {chamada.status}</p>
          <p><span className="font-bold">Valor da diária:</span> R$ {chamada.valorDiaria}</p>

          {/* Respostas rápidas */}
          <div className="mt-2">
            <p className="font-semibold">💬 Respostas rápidas:</p>
            <RespostasRapidasFreela idChamada={chamada.id} />
          </div>

          {/* Botão check-in */}
          {chamada.status === 'pago' && (
            <button
              onClick={() => fazerCheckin(chamada.id)}
              className="mt-3 w-full bg-green-600 text-white py-2 rounded"
            >
              Fazer Check-in
            </button>
          )}

          {/* Botão check-out */}
          {chamada.status === 'confirmado_checkin_estabelecimento' && (
            <button
              onClick={() => finalizarServico(chamada.id)}
              className="mt-3 w-full bg-blue-600 text-white py-2 rounded"
            >
              Finalizar o serviço
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
