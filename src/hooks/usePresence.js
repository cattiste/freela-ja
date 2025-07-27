import { useEffect } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function usePresence(uid) {
  useEffect(() => {
    if (!uid) return

    const ref = doc(db, 'usuarios', uid)

    const update = () =>
      updateDoc(ref, {
        ultimaAtividade: serverTimestamp()
      })

    update()
    const interval = setInterval(update, 60000)

    return () => clearInterval(interval)
  }, [uid])
}
