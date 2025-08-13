// src/hooks/useRealtimePresence.js
import { useEffect } from 'react'
import { rtdb, db } from '@/firebase'
import { ref, onValue, onDisconnect, set, serverTimestamp as rtdbNow } from 'firebase/database'
import { doc, setDoc, serverTimestamp as fsNow } from 'firebase/firestore'

export function useRealtimePresence(usuario) {
  useEffect(() => {
    if (!usuario?.uid) return

    const uid = usuario.uid
    const statusRef = ref(rtdb, `/status/${uid}`)
    const infoConnectedRef = ref(rtdb, '.info/connected')

    console.log('[presence] init for', uid)

    const unsub = onValue(infoConnectedRef, async (snap) => {
      const connected = snap.val() === true
      console.log('[presence] .info/connected =', connected)

      if (!connected) {
        // Opcional: espelhar offline no Firestore
        try {
          await setDoc(doc(db, 'status', uid), { state: 'offline', last_changed: fsNow() }, { merge: true })
          console.log('[presence] espelhado FS offline (desconectado local)')
        } catch (e) {
          console.warn('[presence] falha espelhar FS offline:', e)
        }
        return
      }

      try {
        await onDisconnect(statusRef).set({ state: 'offline', last_changed: rtdbNow() })
        console.log('[presence] onDisconnect set OK')

        await set(statusRef, { state: 'online', last_changed: rtdbNow() })
        console.log('[presence] set RTDB online OK')

        await setDoc(doc(db, 'status', uid), { state: 'online', last_changed: fsNow() }, { merge: true })
        console.log('[presence] espelhado FS online OK')
      } catch (e) {
        console.error('[presence] erro:', e)
      }
    })

    // Marca offline ao fechar/ocultar (melhora responsividade de status)
    const handleVisibility = async () => {
      if (document.visibilityState === 'hidden') {
        try {
          await set(statusRef, { state: 'offline', last_changed: rtdbNow() })
          await setDoc(doc(db, 'status', uid), { state: 'offline', last_changed: fsNow() }, { merge: true })
          console.log('[presence] página oculta → offline')
        } catch (e) { /* silencioso */ }
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      unsub()
      // No unmount não forçamos nada; onDisconnect já está configurado.
      console.log('[presence] cleanup for', uid)
    }
  }, [usuario?.uid])
}
