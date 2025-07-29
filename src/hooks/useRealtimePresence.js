import { useEffect } from 'react'
import { getDatabase, ref, set, onDisconnect, serverTimestamp } from 'firebase/database'

export function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const db = getDatabase()
    const statusRef = ref(db, 'users/' + uid)

    onDisconnect(statusRef).update({
      online: false,
      lastSeen: serverTimestamp()
    })

    set(statusRef, {
      online: true,
      lastSeen: serverTimestamp()
    })
  }, [uid])
}