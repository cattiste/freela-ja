import React, { useEffect, useState } from 'react'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'
import ChamadaInline from '@/components/ChamadaInline'
import { useAuth } from '@/context/AuthContext'

export default function ChamadasFreela() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('freelaUid', '==', usuario.uid)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [usuario])

  if (!usuario?.uid) {
    return (
      <div className="text-center text-red-600 mt-10">
        ⚠️ Acesso não autorizado. Faça login novamente.
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center text-orange-600 mt-10">
        🔄 Carregando chamadas...
      </div>
    )
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">
        📞 Chamadas Recentes
      </h1>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada encontrada.</p>
      ) : (
        chamadas.map((chamada) => (
          <ChamadaInline
            key={chamada.id}
            chamada={chamada}
            usuario={usuario}
            tipo="freela"
          />
        ))
      )}
    </div>
  )
}
