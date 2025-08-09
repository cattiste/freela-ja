import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue, off } from 'firebase/database'

/**
 * Lê presença de múltiplas origens no RTDB e unifica em:
 * { [uid]: { online: boolean, ultimaAtividade?: number } }
 *
 * Origens:
 *  - /status/{uid} -> { online, ultimaAtividade }
 *  - /users/{uid}  -> pode ser { online, ultimaAtividade } ou boolean legado
 */
export default function useUsuariosOnlineEstab() {
  const [mapa, setMapa] = useState({})

  useEffect(() => {
    const db = getDatabase()
    const refs = [
      { key: 'status', r: ref(db, 'status') },
      { key: 'users',  r: ref(db, 'users')  }, // compatibilidade com legado
    ]

    const state = { status: {}, users: {} }

    const apply = () => {
      const out = {}
      const uids = new Set([
        ...Object.keys(state.status || {}),
        ...Object.keys(state.users || {}),
      ])
      uids.forEach((uid) => {
        const s = state.status[uid]
        const u = state.users[uid]
        // Normaliza /status
        const fromStatus = s && typeof s === 'object'
          ? { online: !!s.online, ultimaAtividade: s.ultimaAtividade }
          : null
        // Normaliza /users (pode ser boolean, objeto, etc.)
        let fromUsers = null
        if (u != null) {
          if (typeof u === 'boolean') {
            fromUsers = { online: !!u }
          } else if (typeof u === 'object') {
            fromUsers = { online: !!u.online, ultimaAtividade: u.ultimaAtividade }
          }
        }
        const merged = fromStatus || fromUsers || { online: false }
        out[uid] = merged
      })
      setMapa(out)
    }

    const handlers = refs.map(({ key, r }) => {
      const h = (snap) => {
        state[key] = snap.val() || {}
        apply()
      }
      onValue(r, h)
      return { r, h }
    })

    return () => {
      handlers.forEach(({ r, h }) => off(r, 'value', h))
    }
  }, [])

  return mapa
}
