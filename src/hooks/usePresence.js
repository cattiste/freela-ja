import { useEffect } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function usePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const docRef = doc(db, 'usuarios', uid)

    // Atualiza última atividade a cada 30 segundos
    const interval = setInterval(() => {
      updateDoc(docRef, { ultimaAtividade: serverTimestamp() }).catch(console.error)
    }, 30000)

    // Atualiza na montagem (logo que abre)
    updateDoc(docRef, { ultimaAtividade: serverTimestamp() }).catch(console.error)

    return () => clearInterval(interval)
  }, [uid])
}
