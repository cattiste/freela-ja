import { useEffect, useMemo, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '@/firebase'

export function useChamadasDoContratante(uid, statusLista) {
  const [chamadas, setChamadas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', uid),
      where('status', 'in', statusLista)
    )
    const unsub = onSnapshot(q, (snap) => {
      setChamadas(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return () => unsub()
  }, [uid])

  const chamadasOrdenadas = useMemo(() => {
    const ts = (x) => x?.toMillis?.() ?? (x?.seconds ? x.seconds * 1000 : 0)
    return [...chamadas].sort((a, b) => ts(b.criadoEm) - ts(a.criadoEm))
  }, [chamadas])

  return { chamadas: chamadasOrdenadas, loading }
}