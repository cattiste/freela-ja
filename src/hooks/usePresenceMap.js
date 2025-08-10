// src/hooks/usePresenceMap.js
import { useEffect, useState } from 'react'
import { subscribePresenceMap } from '@/realtime/presenca'

export default function usePresenceMap(ttlMs = 120_000) {
  const [map, setMap] = useState({})
  useEffect(() => {
    const unsub = subscribePresenceMap(setMap, { ttlMs })
    return () => unsub()
  }, [ttlMs])
  return map
}
