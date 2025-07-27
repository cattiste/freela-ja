// src/hooks/usePresence.js
import { useEffect } from 'react'
import { doc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function usePresence(uid) {
  useEffect(() => {
    if (!uid) {
      console.warn('[usePresence] UID ausente. Não será possível registrar presença.')
      return
    }

    const userRef = doc(db, 'usuarios', uid)
    const statusRef = doc(db, 'status', uid)

    const atualizar = () => {
      const updateData = { ultimaAtividade: serverTimestamp(), online: true }

      updateDoc(userRef, { ultimaAtividade: updateData.ultimaAtividade }).catch((err) =>
        console.error('[usePresence] Erro ao atualizar usuarios:', err)
      )

      setDoc(statusRef, updateData, { merge: true }).catch((err) =>
        console.error('[usePresence] Erro ao atualizar status:', err)
      )
    }

    console.log(`[usePresence] Iniciando presença para UID: ${uid}`)
    atualizar()

    const interval = setInterval(atualizar, 30000)

    return () => {
      clearInterval(interval)
      console.log(`[usePresence] Parando atualização de presença para UID: ${uid}`)
    }
  }, [uid])
}
