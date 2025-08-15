// src/realtime/presenca.js
import {
  getDatabase, ref, onValue, onDisconnect, update, set,
  serverTimestamp, push, off
} from 'firebase/database'

// Inicia presença do usuário logado no RTDB
export function initPresence(uid) {
  if (!uid) return () => {}
  const rdb = getDatabase()
  const connectedRef = ref(rdb, '.info/connected')
  const baseRef = ref(rdb, `status/${uid}`)
  const connsRef = ref(rdb, `status/${uid}/connections`)
  const stateRef = ref(rdb, `status/${uid}/state`)
  const onlineRef = ref(rdb, `status/${uid}/online`)
  const lastSeenRef = ref(rdb, `status/${uid}/last_seen`)

  let heartbeatTimer = null
  let connRef = null

  const unsub = onValue(connectedRef, (snap) => {
    const isConnected = snap.val() === true
    if (!isConnected) return

    connRef = push(connsRef)
    onDisconnect(connRef).remove()
    onDisconnect(stateRef).set('offline')
    onDisconnect(onlineRef).set(false)
    onDisconnect(lastSeenRef).set(serverTimestamp())

    update(baseRef, { state: 'online', online: true, last_seen: serverTimestamp() })

    if (heartbeatTimer) clearInterval(heartbeatTimer)
    heartbeatTimer = setInterval(() => set(lastSeenRef, serverTimestamp()), 30_000)

    set(connRef, true)
  })

  return () => {
    try {
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      if (connRef) set(connRef, null)
      off(connectedRef)
      update(baseRef, { state: 'offline', online: false, last_seen: serverTimestamp() })
    } catch {}
  }
}

// TTL padrão: 2 min
const TTL_PADRAO_MS = 120_000

function isFresh(lastSeen, ttlMs) {
  const now = Date.now()
  const n = typeof lastSeen === 'number' ? lastSeen : Number(lastSeen || 0)
  return Number.isFinite(n) && now - n <= ttlMs
}

// Assina mapa de presença e aplica TTL
export function subscribePresenceMap(cb, { ttlMs = TTL_PADRAO_MS } = {}) {
  const rdb = getDatabase()
  const rootRef = ref(rdb, 'status')

  const unsub = onValue(rootRef, (snap) => {
    const out = {}
    snap.forEach((child) => {
      const uid = child.key
      const v = child.val() || {}
      const flagOnline = v.online === true || v.state === 'online'
      const fresh = isFresh(v.last_seen, ttlMs)
      const hasConn = v.connections && typeof v.connections === 'object' && Object.keys(v.connections).length > 0
      if ((flagOnline && fresh) || hasConn) {
        out[uid] = { ...v, online: true, state: 'online' }
      }
    })
    cb(out)
  })

  return () => {
    off(rootRef)
    unsub?.()
  }
}
