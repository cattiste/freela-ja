// src/hooks/useSetupPresence.js
import { useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/firebase'
import {
  getDatabase, ref as rRef, onDisconnect, onValue, set as rSet, serverTimestamp as rtdbServerTS
} from 'firebase/database'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'

export default function useSetupPresence() {
  useEffect(() => {
    const dbR = getDatabase()

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log('[presence] user not logged in; skipping')
        return
      }

      const uid = user.uid
      const rtdbStatusRef = rRef(dbR, `/status/${uid}`)

      const isOnlineVal = { state: 'online', last_changed: rtdbServerTS() }
      const isOfflineVal = { state: 'offline', last_changed: rtdbServerTS() }

      try {
        await onDisconnect(rtdbStatusRef).set(isOfflineVal)
        console.log('[presence] onDisconnect set OK')
      } catch (e) {
        console.error('[presence] onDisconnect set FAILED', e)
      }

      try {
        await rSet(rtdbStatusRef, isOnlineVal)
        console.log('[presence] set RTDB online OK')
      } catch (e) {
        console.error('[presence] set RTDB online FAILED', e)
      }

      onValue(rtdbStatusRef, async (snap) => {
        const val = snap.val()
        console.log('[presence] onValue', val)
        if (!val) return
        try {
          await setDoc(
            doc(db, 'status', uid),
            { state: val.state, last_changed: serverTimestamp() },
            { merge: true }
          )
          console.log('[presence] mirrored to Firestore /status', uid, val.state)
        } catch (e) {
          console.error('[presence] mirror to Firestore FAILED', e)
        }
      })
    })

    return () => unsub()
  }, [])
}
