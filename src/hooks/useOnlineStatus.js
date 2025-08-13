import { useEffect, useState } from 'react'
import { db } from '@/firebase'
import { doc, onSnapshot } from 'firebase/firestore'

export function useOnlineStatus(uid) {
  const [online, setOnline] = useState(false)
  const [lastChanged, setLastChanged] = useState(null)

  useEffect(() => {
    if (!uid) return
    const unsub = onSnapshot(doc(db, 'status', uid), (snap) => {
      const d = snap.data()
      setOnline(d?.state === 'online')
      setLastChanged(d?.last_changed || null)
    }, (e) => console.error('[useOnlineStatus] erro:', e))
    return () => unsub()
  }, [uid])

  return { online, lastChanged }
}
