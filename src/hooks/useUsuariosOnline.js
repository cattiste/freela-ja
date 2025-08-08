// src/hooks/useUsuariosOnline.js
import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'
import { app } from '@/firebase'

export function useUsuariosOnline() {
  const [usuariosOnline, setUsuariosOnline] = useState({})

  useEffect(() => {
    const db = getDatabase(app)
    const usersRef = ref(db, 'users')

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      setUsuariosOnline(data)
    })

    return () => unsubscribe()
  }, [])

  return usuariosOnline
}
