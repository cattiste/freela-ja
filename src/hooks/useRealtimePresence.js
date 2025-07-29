import { useEffect } from 'react'
import {
  getDatabase,
  ref,
  onDisconnect,
  set,
  onValue,
  serverTimestamp
} from 'firebase/database'

export function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const db = getDatabase()
    const userRef = ref(db, `users/${uid}`)
    const connectedRef = ref(db, '.info/connected')

    const unsubscribe = onValue(connectedRef, (snap) => {
      const connected = snap.val()
      if (connected) {
        // Desconectar automaticamente ao sair
        onDisconnect(userRef).set({
          online: false,
          lastSeen: serverTimestamp()
        })

        // Marcar como online assim que conectado
        set(userRef, {
          online: true,
          lastSeen: serverTimestamp()
        })
      }
    })

    // Ao desmontar o componente, marca offline
    return () => {
      set(userRef, {
        online: false,
        lastSeen: serverTimestamp()
      })
    }
  }, [uid])
}
