// src/hooks/pf/useUsuariosOnlinePF.js
import { useEffect, useState } from 'react'
import { getDatabase, ref, onValue, off } from 'firebase/database'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

export default function useUsuariosOnlinePF() {
  const [mapIdx, setMapIdx] = useState({})
  const [mapFallback, setMapFallback] = useState({})
  const [usandoFallback, setUsandoFallback] = useState(false)

  // 1) Índice: /public/onlineFreelas
  useEffect(() => {
    const rtdb = getDatabase()
    const r = ref(rtdb, 'public/onlineFreelas')
    const h = (snap) => {
      const val = snap.val() || {}
      const out = {}
      Object.values(val).forEach((f) => {
        if (f?.uid && f?.online === true) out[f.uid] = { online: true }
      })
      setMapIdx(out)      
      setUsandoFallback(Object.keys(out).length === 0)
    }
    onValue(r, h)
    return () => off(r, 'value', h)
  }, [])
  
  useEffect(() => {
    if (!usandoFallback) return
    const rtdb = getDatabase()
    const r = ref(rtdb, 'status')
    let cancel = false

    const h = async (snap) => {
      const st = snap.val() || {}
      const uids = Object.entries(st)
        .filter(([, s]) => s?.online === true)
        .map(([uid]) => uid)

      const out = {}
      await Promise.all(
        uids.map(async (uid) => {
          const d = await getDoc(doc(db, 'usuarios', uid))
          if (!d.exists()) return
          const u = d.data()
          const isFreela = u?.tipoConta === 'funcional' && u?.tipoUsuario === 'freela'
          if (isFreela) out[uid] = { online: true }
        })
      )

      if (!cancel) setMapFallback(out)
    }

    onValue(r, h)
    return () => {
      off(r, 'value', h)
      cancel = true
    }
  }, [usandoFallback])

  return usandoFallback ? mapFallback : mapIdx
}
