// useRealtimePresence.js com suporte a 'online' e 'lastSeen'

import { useEffect } from 'react'
import { getDatabase, ref, update, onDisconnect, serverTimestamp } from 'firebase/database'

export function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const db = getDatabase()
    const userStatusRef = ref(db, 'users/' + uid)

    // Quando sair ou cair a conexão
    onDisconnect(userStatusRef).update({
      online: false,
      lastSeen: serverTimestamp()
    })

    // Marca como online agora
    update(userStatusRef, {
      online: true,
      lastSeen: serverTimestamp()
    }).catch(console.error)
  }, [uid])
}