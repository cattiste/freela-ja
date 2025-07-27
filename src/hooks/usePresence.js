import { useEffect } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function usePresence(uid) {
  useEffect(() => {
    // 🔒 Proteção extra contra UID inválido
    if (!uid || typeof uid !== 'string') {
      console.warn('[usePresence] UID inválido ou ausente:', uid)
      return
    }

    const docRef = doc(db, 'usuarios', uid)
    console.log(`[usePresence] Iniciando presença para UID: ${uid}`)

    // Atualiza imediatamente ao montar
    updateDoc(docRef, { ultimaAtividade: serverTimestamp() })
      .then(() => {
        console.log(`[usePresence] Atualização imediata enviada para UID: ${uid}`)
      })
      .catch((err) => {
        console.error(`[usePresence] Erro na atualização imediata:`, err)
      })

    // Atualiza a cada 30 segundos
    const interval = setInterval(() => {
      updateDoc(docRef, { ultimaAtividade: serverTimestamp() })
        .then(() => {
          console.log(`[usePresence] Presença registrada: ${new Date().toLocaleTimeString()}`)
        })
        .catch((err) => {
          console.error(`[usePresence] Erro ao registrar presença:`, err)
        })
    }, 30000)

    // Cleanup
    return () => {
      clearInterval(interval)
      console.log(`[usePresence] Parando atualização de presença para UID: ${uid}`)
    }
  }, [uid])
}
