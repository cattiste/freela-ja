// useUsuariosOnline.js - escuta /users/{uid} com status e lastSeen

import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'

export function useUsuariosOnline() {
  const [usuarios, setUsuarios] = useState({})

  useEffect(() => {
    const db = getDatabase()
    const refStatus = ref(db, 'users')

    const unsub = onValue(refStatus, (snapshot) => {
      const data = snapshot.val() || {}
      setUsuarios(data)
    })

    return () => unsub()
  }, [])

  return usuarios
}