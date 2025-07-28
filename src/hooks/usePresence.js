// usePresence.js - Atualiza ultimaAtividade com proteção de UID

import { useEffect } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function usePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const ref = doc(db, 'usuarios', uid)

    const interval = setInterval(() => {
      updateDoc(ref, {
        ultimaAtividade: serverTimestamp()
      }).catch((err) => {
        console.error('Erro ao atualizar presença:', err)
      })
    }, 30000) // atualiza a cada 30 segundos

    return () => clearInterval(interval)
  }, [uid])
}