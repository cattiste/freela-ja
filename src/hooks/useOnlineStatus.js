// src/hooks/useOnlineStatus.js
import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export function useOnlineStatus(uid) {
  const [online, setOnline] = useState(false)
  const [ultimaAtividade, setUltimaAtividade] = useState(null)

  useEffect(() => {
    if (!uid) return

    const docRef = doc(db, 'usuarios', uid)

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) {
        setOnline(false)
        setUltimaAtividade(null)
        return
      }

      const data = snap.data()
      const ts = data.ultimaAtividade

      setUltimaAtividade(ts)

      if (!ts) {
        setOnline(false)
        return
      }

      const agora = Date.now()
      const ultima = ts.toMillis()
      const diferencaMs = agora - ultima

      // ✅ Considera online se a última atividade foi há menos de 2 minutos
      setOnline(diferencaMs < 2 * 60 * 1000)

      // 💬 Para debug (pode remover depois)
      console.log(`[useOnlineStatus] ${uid} → ${Math.floor(diferencaMs / 1000)}s atrás → ${diferencaMs < 2 * 60 * 1000 ? '🟢 Online' : '🔴 Offline'}`)
    })

    return () => unsubscribe()
  }, [uid])

  return { online, ultimaAtividade }
}
