// src/hooks/pf/useUsuariosOnlinePF.js
import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue, off } from 'firebase/database'

export default function useUsuariosOnlinePF() {
  const [usuariosOnline, setUsuariosOnline] = useState({})

  useEffect(() => {
    const db = getDatabase()
    const refStatus = ref(db, 'status')
    const handler = (snap) => setUsuariosOnline(snap.val() || {})
    onValue(refStatus, handler)
    return () => off(refStatus, 'value', handler)
  }, [])

  return usuariosOnline
}
