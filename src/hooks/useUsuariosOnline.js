// src/hooks/useUsuariosOnline.js
import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'

export function useUsuariosOnline() {
  const [usuariosOnline, setUsuariosOnline] = useState({})

  useEffect(() => {
    const db = getDatabase()
    const usersRef = ref(db, 'users')

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      setUsuariosOnline(data)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  return usuariosOnline
}
