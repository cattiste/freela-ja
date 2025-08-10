// src/hooks/useSetupPresence.js
import { useEffect, useRef } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { useLocation } from 'react-router-dom'
import { auth } from '@/firebase'
import { initPresence } from '@/realtime/presenca'

/**
 * Liga presença no RTDB só quando:
 * - user logado
 * - rota passa no gate (opcional)
 * - aba visível (opcional: gateByVisibility)
 */
export default function useSetupPresence({
  gateByRoute = (path) => true,
  gateByVisibility = true,
} = {}) {
  const cleanupRef = useRef(() => {})
  const userRef = useRef(null)
  const loc = useLocation()

  useEffect(() => {
    let mounted = true

    const togglePresence = async () => {
      if (!mounted) return
      const user = userRef.current
      const routeOk = gateByRoute(loc.pathname)
      const visOk = !gateByVisibility || document.visibilityState === 'visible'
      const shouldStart = !!user?.uid && routeOk && visOk

      // desliga se não deve estar online
      if (!shouldStart) {
        cleanupRef.current?.()
        cleanupRef.current = () => {}
        return
      }

      // (re)liga presença
      cleanupRef.current?.()
      try { await user.getIdToken(true) } catch {}
      cleanupRef.current = initPresence(user.uid)
    }

    const unsubAuth = onAuthStateChanged(auth, (u) => {
      userRef.current = u || null
      togglePresence()
    })

    const onVis = () => {
      if (!gateByVisibility) return
      togglePresence()
    }
    document.addEventListener('visibilitychange', onVis)

    // roda também ao trocar de rota
    togglePresence()

    return () => {
      mounted = false
      document.removeEventListener('visibilitychange', onVis)
      cleanupRef.current?.()
      unsubAuth()
    }
  }, [loc.pathname, gateByRoute, gateByVisibility])
}
