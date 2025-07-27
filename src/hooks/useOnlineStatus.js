// src/hooks/useOnlineStatus.js
import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

export function useOnlineStatus(uid) {
  const [online, setOnline] = useState(false)
  const [ultimaAtividade, setUltimaAtividade] = useState(null)

  useEffect(() => {
    // 🔒 Proteção contra UID nulo ou inválido
    if (!uid || typeof uid !== 'string') {
      console.warn('[useOnlineStatus] UID inválido ou ausente:', uid)
      setOnline(false)
      setUltimaAtividade(null)
      return
    }

    const docRef = doc(db, 'usuarios', uid)

    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (!snap.exists()) {
        console.warn('[useOnlineStatus] Documento não encontrado para UID:', uid)
        setOnline(false)
        setUltimaAtividade(null)
        return
      }

      const data = snap.data()
      const ts = data.ultimaAtividade

      setUltimaAtividade(ts)

      if (!ts || typeof ts.toMillis !== 'function') {
        setOnline(false)
        return
      }

      const agora = Date.now()
      const ultima = ts.toMillis()
      const diferencaMs = agora - ultima

      // ✅ Online se menos de 2 min
      const statusOnline = diferencaMs < 2 * 60 * 1000
      setOnline(statusOnline)

      // 🔍 Debug (pode remover em prod)
      console.log(`[useOnlineStatus] ${uid} → ${Math.floor(diferencaMs / 1000)}s atrás → ${statusOnline ? '🟢 Online' : '🔴 Offline'}`)
    }, (error) => {
      console.error('[useOnlineStatus] Erro no snapshot:', error)
      setOnline(false)
      setUltimaAtividade(null)
    })

    return () => unsubscribe()
  }, [uid])

  return { online, ultimaAtividade }
}
