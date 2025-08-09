import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebase'

/**
 * Lê /status no Firestore e entrega { [uid]: { online: true|false, state: 'online'|'offline' } }
 * Compatível com o seu filtro: usuariosOnline[f.id]?.online === true
 */
export function useUsuariosOnline() {
  const [usuariosOnline, setUsuariosOnline] = useState({})

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'status'), (snap) => {
      const map = {}
      snap.forEach((docu) => {
        const data = docu.data()
        const online = data?.state === 'online'
        map[docu.id] = { online, state: data?.state || 'offline' }
      })
      setUsuariosOnline(map)
    })
    return () => unsub()
  }, [])

  return { usuariosOnline }
}
