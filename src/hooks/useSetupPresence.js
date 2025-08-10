// src/hooks/useSetupPresence.js
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/firebase'
import {
  getDatabase,
  ref as rRef,
  onDisconnect,
  onValue,
  set as rSet,
  update as rUpdate,
  serverTimestamp as rtdbServerTS,
} from 'firebase/database'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export default function useSetupPresence() {
  useEffect(() => {
    const rdb = getDatabase()

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        // usuário saiu -> nada pra fazer aqui; onDisconnect cuidará do RTDB
        return
      }

      const uid = user.uid
      const rtdbStatusRef = rRef(rdb, `/status/${uid}`)
      const rtdbUserRef   = rRef(rdb, `/users/${uid}`)

      const ONLINE  = { state: 'online',  last_changed: rtdbServerTS() }
      const OFFLINE = { state: 'offline', last_changed: rtdbServerTS() }

      try {
        // Quando desconectar: marca offline em /status e atualiza /users
        await onDisconnect(rtdbStatusRef).set(OFFLINE)
        await onDisconnect(rtdbUserRef).update({ online: false, lastSeen: rtdbServerTS() })

        // Marca online agora (RTDB)
        await rSet(rtdbStatusRef, ONLINE)
        await rUpdate(rtdbUserRef, { online: true, lastSeen: rtdbServerTS() })
      } catch (e) {
        console.error('[presence] RTDB init failed', e)
      }

      // Espelha mudanças do RTDB /status -> Firestore status/{uid}
      onValue(rtdbStatusRef, async (snap) => {
        const val = snap.val()
        if (!val) return
        try {
          // Firestore: status/{uid}
          await setDoc(
            doc(db, 'status', uid),
            { state: val.state, last_changed: serverTimestamp() },
            { merge: true }
          )

          // RTDB: também manter /users consistente se o estado mudar por qualquer motivo
          await rUpdate(rtdbUserRef, {
            online: val.state === 'online',
            lastSeen: rtdbServerTS(),
          })
        } catch (e) {
          console.error('[presence] mirror failed', e)
        }
      })
    })

    return () => unsub()
  }, [])
}
