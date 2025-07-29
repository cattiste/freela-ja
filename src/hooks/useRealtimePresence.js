import { useEffect } from 'react'
import { getDatabase, ref, onDisconnect, set, serverTimestamp } from 'firebase/database'

export function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const db = getDatabase()
    const userRef = ref(db, `users/${uid}`)

    // Marca como online
    set(userRef, {
      online: true,
      lastSeen: serverTimestamp()
    })

    // Define o comportamento ao se desconectar (automático pelo Firebase)
    onDisconnect(userRef).set({
      online: false,
      lastSeen: serverTimestamp()
    })

    // Quando desmontar o componente (logout ou sair do painel)
    return () => {
      set(userRef, {
        online: false,
        lastSeen: serverTimestamp()
      })
    }
  }, [uid])
}
