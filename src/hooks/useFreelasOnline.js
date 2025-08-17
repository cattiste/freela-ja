// src/hooks/useFreelasOnline.js
import { useEffect, useState } from 'react'
import { db } from '@/firebase'
import { getDocs, collection, query, where } from 'firebase/firestore'

export function useFreelasOnline(uids = []) {
  const [perfis, setPerfis] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uids || uids.length === 0) {
      setPerfis([])
      setLoading(false)
      return
    }

    const carregar = async () => {
      setLoading(true)
      try {
        const ref = collection(db, 'usuarios')
        const q = query(ref, where('uid', 'in', uids))
        const snap = await getDocs(q)
        const lista = snap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        setPerfis(lista)
      } catch (err) {
        console.error('[useFreelasOnline] erro ao carregar freelas online:', err)
        setPerfis([])
      }
      setLoading(false)
    }

    carregar()
  }, [JSON.stringify(uids)]) // evita múltiplas chamadas desnecessárias

  return { perfis, loading }
}
