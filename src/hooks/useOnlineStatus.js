import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export function useOnlineStatus(uid) {
  const [online, setOnline] = useState(false)
  const [ultimaAtividade, setUltimaAtividade] = useState(null)

  useEffect(() => {
    if (!uid) return

    const ref = doc(db, 'usuarios', uid)

    const unsubscribe = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setOnline(false)
        setUltimaAtividade(null)
        return
      }

      const data = snap.data()
      const ts = data.ultimaAtividade

      setUltimaAtividade(ts || null)

      if (!ts?.toMillis) {
        setOnline(false)
        return
      }

      const agora = Date.now()
      const ultima = ts.toMillis()
      const diff = agora - ultima

      setOnline(diff < 2 * 60 * 1000) // menos de 2min = online

      // Debug
      console.log(`[useOnlineStatus] ${uid} → ${Math.floor(diff / 1000)}s atrás → ${diff < 120000 ? '🟢 Online' : '🔴 Offline'}`)
    })

    return () => unsubscribe()
  }, [uid])

  return { online, ultimaAtividade }
}
