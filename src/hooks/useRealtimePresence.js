// src/hooks/useRealtimePresence.js
import { useState, useEffect } from 'react'
import { rtdb, db } from '@/firebase'
import {
  ref,
  onValue,
  onDisconnect,
  set,
  get,
  serverTimestamp as rtdbNow,
} from 'firebase/database'
import {
  doc,
  setDoc,
  serverTimestamp as fsNow,
  collection,
  onSnapshot,
} from 'firebase/firestore'

/**
 * Marca presença do usuário e escuta status online de todos.
 */
export function useRealtimePresence(usuario) {
  const [usuariosOnline, setUsuariosOnline] = useState({})

  // 1) Marca presença do usuário atual
  useEffect(() => {
    if (!usuario?.uid || typeof usuario.uid !== 'string') return
    const rawUid = usuario.uid.trim()
    if (/[.#$\[\]]/.test(rawUid)) return

    const uid = rawUid
    const statusPath = `status/${uid}`
    const statusRef = ref(rtdb, statusPath)
    const infoConnectedRef = ref(rtdb, '.info/connected')
    let mounted = true
    let visTimer = null

    get(ref(rtdb, '.info/serverTimeOffset')).catch(() => {})

    const setRTDB = (data) => set(statusRef, data)
    const setFS = (data) =>
      setDoc(doc(db, 'status', uid), data, { merge: true })

    const goOnline = async () => {
      try {
        await onDisconnect(statusRef).set({
          state: 'offline',
          last_changed: rtdbNow(),
        })
        await setRTDB({ state: 'online', last_changed: rtdbNow() })
        await setFS({ state: 'online', last_changed: fsNow() })
      } catch (e) {
        console.error('[presence] erro ao marcar online:', e)
      }
    }

    const goOffline = async () => {
      try {
        await setRTDB({ state: 'offline', last_changed: rtdbNow() })
        await setFS({ state: 'offline', last_changed: fsNow() })
      } catch (_) {}
    }

    const unsubscribeRTDB = onValue(infoConnectedRef, async (snap) => {
      if (!mounted) return
      const connected = snap.val() === true
      if (!connected) {
        try {
          await setFS({ state: 'offline', last_changed: fsNow() })
        } catch (_) {}
        return
      }
      await goOnline()
    })

    const handleVisibility = () => {
      if (visTimer) clearTimeout(visTimer)
      visTimer = setTimeout(async () => {
        if (!mounted) return
        if (document.visibilityState === 'hidden') {
          await goOffline()
        } else {
          await goOnline()
        }
      }, 150)
    }

    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      mounted = false
      if (visTimer) clearTimeout(visTimer)
      document.removeEventListener('visibilitychange', handleVisibility)
      unsubscribeRTDB()
    }
  }, [usuario?.uid])

  // 2) Escuta todos online via Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'status'), (snap) => {
      const mapa = {}
      snap.forEach((doc) => {
        mapa[doc.id] = doc.data()
      })
      setUsuariosOnline(mapa)
    })
    return () => unsub()
  }, [])

  return { usuariosOnline }
}
