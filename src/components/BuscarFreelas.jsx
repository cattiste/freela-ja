// src/components/BuscarFreelas.jsx
import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { GeoPoint } from 'firebase/firestore'
import { calcularDistancia } from '@/utils/distancia'

export default function BuscarFreelas() {
  const { usuario } = useAuth()
  const [freelas, setFreelas] = useState([])
  const [mostrarOffline, setMostrarOffline] = useState(false)
  const [confirmados, setConfirmados] = useState({})

  useEffect(() => {
    if (!usuario?.localizacao || !usuario?.tipo) return

    async function carregarFreelas() {
      const snap = await getDocs(query(
        collection(db, 'usuarios'),
        where('tipo', '==', 'freela'),
        where('localizacao', '!=', null)
      ))

      const statusSnap = await getDocs(collection(db, 'status'))
      const statusMap = {}
      statusSnap.forEach(doc => statusMap[doc.id] = doc.data()?.state)

      const lista = []
      for (const docFreela of snap.docs) {
        const freela = { id: docFreela.id, ...docFreela.data() }
        const status = statusMap[freela.id] || 'offline'
        if (status === 'offline' && !mostrarOffline) continue

        freela.status = status

        const distancia = calcularDistancia(
          usuario.localizacao.latitude,
          usuario.localizacao.longitude,
          freela.localizacao.latitude,
          freela.localizacao.longitude
        )
        freela.distancia = distancia.toFixed(2)

        lista.push(freela)
      }

      // ordena online por distância, offline por último
      const ordenados = lista.sort((a, b) => {
        if (a.status !== b.status) return a.status === 'online' ? -1 : 1
        return parseFloat(a.distancia) - parseFloat(b.distancia)
      })

      setFreelas(ordenados)
    }

    carregarFreelas()
  }, [usuario, mostrarOffline])

  async function chamarFreela(freela) {
    const obs = prompt('Deseja incluir alguma observação? (ex: usar roupa preta)')
    const chamadaId = `${usuario.uid}_${new Date().toISOString().replace(/\W/g, '')}`

    const chamada = {
      chamadaId,
      estabelecimentoUid: usuario.uid,
      freelaUid: freela.id,
      criadoEm: serverTimestamp(),
      status: 'pendente',
      valorDiaria: freela.valorDiaria || 100,
      observacao: obs || '',
    }

    await setDoc(doc(db, 'chamadas', chamadaId), chamada)
    alert('Chamada enviada!')
  }

  async function confirmarChamada(freelaId) {
    const snap = await getDocs(query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', usuario.uid),
      where('freelaUid', '==', freelaId),
      where('status', '==', 'aceita')
    ))
    snap.forEach(docSnap => {
      setDoc(doc(db, 'chamadas', docSnap.id), { status: 'confirmada' }, { merge: true })
    })
    setConfirmados(prev => ({ ...prev, [freelaId]: true }))
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Buscar Freelas</h2>
      <label className="block mb-2">
        <input
          type="checkbox"
          checked={mostrarOffline}
          onChange={() => setMostrarOffline(!mostrarOffline)}
        /> Mostrar offline
      </label>

      {freelas.map(f => (
        <div key={f.id} className="bg-white rounded shadow p-4 mb-4 flex flex-col sm:flex-row justify-between items-center">
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{f.nome}</h3>
            <p>Função: {f.funcao}</p>
            <p>Especialidade: {f.especialidade}</p>
            <p>Status: <span className={f.status === 'online' ? 'text-green-600' : 'text-gray-500'}>{f.status}</span></p>
            <p>Distância: {f.distancia} km</p>
            <p>Valor diária: R$ {f.valorDiaria || 100}</p>
          </div>

          <div className="flex flex-col gap-2 mt-4 sm:mt-0 sm:ml-4">
            <button
              onClick={() => chamarFreela(f)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Chamar
            </button>

            {f.status === 'aceita' && !confirmados[f.id] && (
              <button
                onClick={() => confirmarChamada(f.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Confirmar Chamada
              </button>
            )}

            {confirmados[f.id] && (
              <span className="text-green-600 font-bold">Chamada Confirmada</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
