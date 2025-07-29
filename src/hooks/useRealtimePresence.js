import { useEffect } from 'react'
import { getDatabase, ref, set, onDisconnect, serverTimestamp } from 'firebase/database'

export function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const db = getDatabase()
    const statusRef = ref(db, 'users/' + uid)

    // Remove ao desconectar
    onDisconnect(statusRef).update({
      online: false,
      lastSeen: serverTimestamp()
    })

    // Marca como online
    set(statusRef, {
      online: true,
      lastSeen: serverTimestamp()
    })
  }, [uid])
}
