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
import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue, off } from 'firebase/database'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

/**
 * Lê /public/onlineFreelas (Functions). Se vazio, cai para /status + Firestore (só freelas).
 * Retorna { [uid]: { online: true, perfil: {...} } }
 */
export default function useOnlineFreelasPF() {
  const [mapa, setMapa] = useState({})
  const [fallbackMapa, setFallbackMapa] = useState({})
  const [usandoFallback, setUsandoFallback] = useState(false)

  useEffect(() => {
    const rtdb = getDatabase()
    const refIdx = ref(rtdb, 'public/onlineFreelas')
    const handler = (snap) => {
      const val = snap.val() || {}
      const out = {}
      Object.values(val).forEach((f) => { out[f.uid] = { online: !!f.online, perfil: f } })
      setMapa(out)
      setUsandoFallback(Object.keys(val).length === 0)
    }
    onValue(refIdx, handler)
    return () => off(refIdx, 'value', handler)
  }, [])

  useEffect(() => {
    if (!usandoFallback) return
    const rtdb = getDatabase()
    const refStatus = ref(rtdb, 'status')
    let cancel = false
    const handler = async (snap) => {
      const status = snap.val() || {}
      const uids = Object.entries(status).filter(([, s]) => s?.online).map(([uid]) => uid)
      const out = {}
      await Promise.all(uids.map(async (uid) => {
        const d = await getDoc(doc(db, 'usuarios', uid))
        if (!d.exists()) return
        const data = d.data()
        if (data?.tipo !== 'freela') return
        out[uid] = { online: true, perfil: { id: uid, uid, ...data } }
      }))
      if (!cancel) setFallbackMapa(out)
    }
    onValue(refStatus, handler)
    return () => { off(refStatus, 'value', handler); cancel = true }
  }, [usandoFallback])

  return usandoFallback ? fallbackMapa : mapa
}
