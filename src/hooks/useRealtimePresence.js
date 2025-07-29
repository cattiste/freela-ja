// 📄 src/hooks/useRealtimePresence.js
import { useEffect } from 'react'
import {
  getDatabase,
  ref,
  set,
  onDisconnect,
  onValue,
  serverTimestamp
} from 'firebase/database'
import { app } from '@/firebase' // ✅ importante: usa o app configurado com databaseURL

export function useRealtimePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const db = getDatabase(app) // ✅ evita erro "Feature is disabled"
    const userRef = ref(db, `users/${uid}`)
    const connectedRef = ref(db, '.info/connected')

    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        console.log('🔥 Conectado ao Realtime DB, marcando online para', uid)

        onDisconnect(userRef).set({
          online: false,
          lastSeen: serverTimestamp()
        })

        set(userRef, {
          online: true,
          lastSeen: serverTimestamp()
        }).then(() => {
          console.log('✅ Presença registrada com sucesso:', uid)
        }).catch((err) => {
          console.error('❌ Erro ao gravar presença:', err)
        })
      }
    })

    return () => {
      set(userRef, {
        online: false,
        lastSeen: serverTimestamp()
      }).then(() => {
        console.log('👋 Freela desconectou manualmente:', uid)
      })
    }
  }, [uid])
}
