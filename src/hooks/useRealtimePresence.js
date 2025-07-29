// src/hooks/useRealtimePresence.js
import { useEffect } from 'react'
import { getDatabase, ref, onDisconnect, set, serverTimestamp } from 'firebase/database'
import { getAuth } from 'firebase/auth'

export function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const db = getDatabase()
    const userStatusRef = ref(db, `users/${uid}`)

    // Marca como online
    set(userStatusRef, {
      online: true,
      lastSeen: Date.now(),
    })

    // Remove o status quando desconectar
    onDisconnect(userStatusRef).remove()

    // Atualiza timestamp a cada N segundos se quiser manter vivo
    const interval = setInterval(() => {
      set(userStatusRef, {
        online: true,
        lastSeen: Date.now(),
      })
    }, 60 * 1000) // a cada 1 minuto

    return () => {
      clearInterval(interval)
      set(userStatusRef, {
        online: false,
        lastSeen: Date.now(),
      })
    }
  }, [uid])
}
