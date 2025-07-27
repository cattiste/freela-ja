import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export function useOnlineStatus(uid) {
  const [online, setOnline] = useState(false)
  const [ultimaAtividade, setUltimaAtividade] = useState(null)

  useEffect(() => {
    if (!uid) return

    const ref = doc(db, 'usuarios', uid)
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data()
      const ts = data?.ultimaAtividade
      setUltimaAtividade(ts)
      if (ts) {
        const diff = Date.now() - ts.toMillis()
        setOnline(diff < 120000)
      } else {
        setOnline(false)
      }
    })

    return () => unsub()
  }, [uid])

  return { online, ultimaAtividade }
}
