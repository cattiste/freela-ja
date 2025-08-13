// src/components/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  getDoc,
  doc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { calcularDistancia } from '@/utils/distancia'

export default function BuscarFreelas() {
  const { usuario } = useAuth()
  const [freelas, setFreelas] = useState([])
  const [filtro, setFiltro] = useState('')
  const [apenasOnline, setApenasOnline] = useState(false)

  useEffect(() => {
    if (!usuario?.localizacao) return

    const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
    const unsub = onSnapshot(q, async (snap) => {
      const lista = await Promise.all(
        snap.docs.map(async (docu) => {
          const data = docu.data()
          const statusSnap = await getDoc(doc(db, 'status', docu.id))
          const online = statusSnap.exists() && statusSnap.data().state === 'online'

          let distancia = null
          if (usuario?.localizacao && data?.localizacao) {
            distancia = calcularDistancia(
              usuario.localizacao.latitude,
              usuario.localizacao.longitude,
              data.localizacao.latitude,
              data.localizacao.longitude
            )
          }

          return {
            id: docu.id,
            ...data,
            online,
            distancia: distancia?.toFixed(1)
          }
        })
      )

      const filtrados = lista.filter((f) =>
        f.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
        f.funcao?.toLowerCase().includes(filtro.toLowerCase())
      )

      const ordenados = filtrados.sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1
        return (a.distancia ?? 999) - (b.distancia ?? 999)
      })

      setFreelas(apenasOnline ? ordenados.filter((f) => f.online) : ordenados)
    })

    return () => unsub()
  }, [usuario, filtro, apenasOnline])

  const chamarFreela = async (freela) => {
    if (!usuario?.uid || !freela?.id) return

    const agora = new Date()
    const dataId = agora.toISOString().replace(/[-:.]/g, '').slice(0, 15)
    const chamadaId = `${usuario.uid}_${dataId}`

    await addDoc(collection(db, 'chamadas'), {
      chamadaId,
      criadoEm: serverTimestamp(),
      status: 'pendente',
      estabelecimentoUid: usuario.uid,
      freelaUid: freela.id,
      valor: freela.valorDiaria || 0
    })
  }

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Filtrar por função/especialidade"
        className="w-full p-2 rounded border mb-4"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      <label className="flex items-center space-x-2 mb-4">
        <input
          type="checkbox"
          checked={apenasOnline}
          onChange={(e) => setApenasOnline(e.target.checked)}
        />
        <span>Mostrar apenas online</span>
      </label>

      {freelas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum freelancer disponível.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {freelas.map((freela) => (
            <div
              key={freela.id}
              className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4"
            >
              <img
                src={freela.foto || 'https://via.placeholder.com/100'}
                alt={freela.nome}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <h2 className="font-bold text-lg">
                  {freela.nome}{' '}
                  <span className={`ml-2 text-xs px-2 py-1 rounded-full ${freela.online ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                    {freela.online ? 'Online' : 'Offline'}
                  </span>
                </h2>
                <p className="text-sm text-gray-600">{freela.funcao}</p>
                <p className="text-sm text-gray-600">Distância: {freela.distancia ? `${freela.distancia} km` : '—'}</p>
                <p className="text-sm font-medium mt-1">Diária: R$ {freela.valorDiaria?.toFixed(2)}</p>
              </div>
              <button
                onClick={() => chamarFreela(freela)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Chamar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
