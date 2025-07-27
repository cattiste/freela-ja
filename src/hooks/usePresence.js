// src/hooks/usePresence.js
import { useEffect } from 'react'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function usePresence(uid) {
  useEffect(() => {
    if (!uid) {
      console.warn('[usePresence] UID ausente. Não será possível registrar presença.')
      return
    }

    const docRef = doc(db, 'status', uid)
    console.log(`[usePresence] Iniciando presença para UID: ${uid}`)

    const updateStatus = () =>
      setDoc(docRef, {
        online: true,
        ultimaAtividade: serverTimestamp()
      }, { merge: true })

    updateStatus()

    const interval = setInterval(() => {
      updateStatus()
        .then(() =>
          console.log(`[usePresence] Presença registrada: ${new Date().toLocaleTimeString()}`)
        )
        .catch(err =>
          console.error('[usePresence] Erro ao registrar presença:', err)
        )
    }, 30000)

    return () => clearInterval(interval)
  }, [uid])
}
