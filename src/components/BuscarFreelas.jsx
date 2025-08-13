import React, { useEffect, useState, useMemo } from 'react'
import { db } from '@/firebase'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore'
import { useAuth } from '@/context/AuthContext'
import ProfissionalCard from './ProfissionalCard'
import { calcularDistancia } from '@/utils/distancia' // ✅ usa o util central

export default function BuscarFreelas() {
  const { usuario } = useAuth()
  const [freelas, setFreelas] = useState([])
  const [mostrarSomenteOnline, setMostrarSomenteOnline] = useState(false)

  useEffect(() => {
    if (!usuario?.localizacao || !usuario?.tipo) return

    const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const statusSnap = await getDoc(doc(db, 'status', usuario.uid))
      const meusChamadosSnap = await getDoc(doc(db, 'chamadas', usuario.uid))

      const promises = snapshot.docs.map(async (docUser) => {
        const data = docUser.data()
        const statusRef = doc(db, 'status', docUser.id)
        const statusSnap = await getDoc(statusRef)

        const online = statusSnap.exists() && statusSnap.data().state === 'online'
        const distancia = calcularDistancia(
          usuario.localizacao.latitude,
          usuario.localizacao.longitude,
          data.localizacao.latitude,
          data.localizacao.longitude
        )

        return {
          ...data,
          id: docUser.id,
          online,
          distancia,
        }
      })

      const resultado = await Promise.all(promises)

      // Filtro online
      let filtrado = resultado
      if (mostrarSomenteOnline) {
        filtrado = resultado.filter((f) => f.online)
      }

      // Ordena online primeiro e por proximidade
      filtrado.sort((a, b) => {
        if (a.online && !b.online) return -1
        if (!a.online && b.online) return 1
        return a.distancia - b.distancia
      })

      setFreelas(filtrado)
    })

    return () => unsubscribe()
  }, [usuario, mostrarSomenteOnline])

  const handleChamarFreela = async (freela) => {
    if (!usuario) return

    const chamada = {
      estabelecimentoUid: usuario.uid,
      freelaUid: freela.id,
      status: 'pendente',
      criadoEm: serverTimestamp(),
      valorDiaria: freela.valorDiaria || 0,
    }

    await addDoc(collection(db, 'chamadas'), chamada)
  }

  const handleConfirmarChamada = async (freela) => {
    const q = query(
      collection(db, 'chamadas'),
      where('estabelecimentoUid', '==', usuario.uid),
      where('freelaUid', '==', freela.id),
      where('status', '==', 'aceita')
    )

    const snap = await getDocs(q)
    snap.forEach(async (docItem) => {
      await updateDoc(doc(db, 'chamadas', docItem.id), {
        status: 'confirmada',
        confirmadoEm: serverTimestamp(),
      })
    })
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={mostrarSomenteOnline}
            onChange={() => setMostrarSomenteOnline((prev) => !prev)}
          />
          Mostrar apenas online
        </label>
      </div>

      {freelas.length === 0 && <p>Nenhum freelancer disponível.</p>}

      {freelas.map((freela) => (
        <div key={freela.id} className="mb-4">
          <ProfissionalCard freela={freela} />
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => handleChamarFreela(freela)}
              className="bg-blue-500 text-white px-3 py-1 rounded"
            >
              Chamar
            </button>
            <button
              onClick={() => handleConfirmarChamada(freela)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Confirmar Chamada
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
