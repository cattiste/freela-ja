// useRealtimePresence.js
import { useEffect } from 'react'
import { getDatabase, ref, set, onDisconnect } from 'firebase/database'

export function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const db = getDatabase()
    const statusRef = ref(db, `statusOnline/${uid}`)

    set(statusRef, true)
    onDisconnect(statusRef).remove()
  }, [uid])
}