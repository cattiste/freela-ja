import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'

export function useUsuariosOnline() {
  const [usuarios, setUsuarios] = useState({})

  useEffect(() => {
    const db = getDatabase()
    const statusRef = ref(db, 'users')

    const unsub = onValue(statusRef, (snapshot) => {
      const data = snapshot.val() || {}
      setUsuarios(data)
    })

    return () => unsub()
  }, [])

  return usuarios
}