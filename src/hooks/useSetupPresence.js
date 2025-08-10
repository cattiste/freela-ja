// src/hooks/useSetupPresence.js
import { useEffect, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/firebase'
import { initPresence } from '@/realtime/presenca'

export default function useSetupPresence() {
  const cleanupRef = useRef(() => {})

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      cleanupRef.current?.()
      if (user?.uid) cleanupRef.current = initPresence(user.uid)
      else cleanupRef.current = () => {}
    })
    return () => {
      cleanupRef.current?.()
      unsubAuth()
    }
  }, [])
}
