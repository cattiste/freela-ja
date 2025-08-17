// src/hooks/useFreelasAll.js
import { useEffect, useState } from 'react'
import { db } from '@/firebase'
import { getDocs, collection, query, where } from 'firebase/firestore'

export function useFreelasAll(ativar = false) {
  const [perfis, setPerfis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ativar) {
      setPerfis([])
      setLoading(false)
      return
    }

    const carregar = async () => {
      setLoading(true)
      try {
        const ref = collection(db, 'usuarios')
        const q = query(ref, where('tipo', '==', 'freela'))
        const snap = await getDocs(q)
        const lista = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setPerfis(lista)
      } catch (err) {
        console.error('[useFreelasAll] erro ao carregar freelas:', err)
        setPerfis([])
      }
      setLoading(false)
    }

    carregar()
  }, [ativar])

  return { perfis, loading }
}
