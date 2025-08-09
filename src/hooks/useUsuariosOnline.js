// 📄 src/hooks/useUsuariosOnline.js
import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'
import { app } from '@/firebase' // ✅ importa o app configurado corretamente

export function useUsuariosOnline() {
  const [usuariosOnline, setUsuariosOnline] = useState({})

  useEffect(() => {
    const db = getDatabase(app) // ✅ usa o app com databaseURL
    const usersRef = ref(db, 'users')

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      setUsuariosOnline(data)
    })

    return () => unsubscribe()
  }, [])

  return usuariosOnline
}
