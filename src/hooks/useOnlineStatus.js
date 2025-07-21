import { useEffect, useState } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export function useOnlineStatus(uid) {
  const [online, setOnline] = useState(false)
  const [ultimaAtividade, setUltimaAtividade] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!uid) {
      setOnline(false)
      setUltimaAtividade(null)
      setLoading(false)
      return
    }

    const docRef = doc(db, 'usuarios', uid)

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (!docSnap.exists()) {
        setOnline(false)
        setUltimaAtividade(null)
        setLoading(false)
        return
      }
      const data = docSnap.data()
      const ts = data.ultimaAtividade

      setUltimaAtividade(ts)

      if (!ts) {
        setOnline(false)
      } else {
        const agora = Date.now()
        const ultima = ts.toMillis()
        setOnline(agora - ultima < 15 * 1000) // 15 segundos
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [uid])

  return { online, ultimaAtividade, loading }
}
