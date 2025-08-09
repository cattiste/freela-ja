// src/hooks/useSetupPresence.js
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/firebase'
import { getDatabase, ref as rRef, onDisconnect, onValue, set as rSet, serverTimestamp as rtdbServerTS } from 'firebase/database'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

/**
 * Usa RTDB para detectar desconexão e espelha estado em Firestore (/status/{uid})
 * Chame esse hook no topo do seu <App /> após Firebase estar inicializado.
 */
export default function useSetupPresence() {
  useEffect(() => {
    const dbR = getDatabase()

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return

      const uid = user.uid
      const rtdbStatusRef = rRef(dbR, `/status/${uid}`)

      // Valor "online" que vamos gravar quando conectado
      const isOnlineVal = {
        state: 'online',
        last_changed: rtdbServerTS(),
      }

      // Valor "offline" pra onDisconnect
      const isOfflineVal = {
        state: 'offline',
        last_changed: rtdbServerTS(),
      }

      // Sempre marca onDisconnect=offline
      await onDisconnect(rtdbStatusRef).set(isOfflineVal)
      // Marca online agora
      await rSet(rtdbStatusRef, isOnlineVal)

      // Espelha RTDB -> Firestore (/status/{uid})
      onValue(rtdbStatusRef, async (snap) => {
        const val = snap.val()
        if (!val) return
        await setDoc(
          doc(db, 'status', uid),
          {
            state: val.state,
            last_changed: serverTimestamp(),
          },
          { merge: true }
        )
      })
    })

    return () => unsub()
  }, [])
}
