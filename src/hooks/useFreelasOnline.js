// useFreelasOnline.js
import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'

export function useFreelasOnline() {
  const [freelasOnline, setFreelasOnline] = useState({})

  useEffect(() => {
    const db = getDatabase()
    const statusRef = ref(db, 'statusOnline')

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val() || {}
      setFreelasOnline(data)
    })

    return () => unsubscribe()
  }, [])

  return freelasOnline
}