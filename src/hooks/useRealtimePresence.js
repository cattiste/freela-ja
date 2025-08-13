import { useEffect } from 'react'
import { ref, onValue, onDisconnect, set, get } from 'firebase/database'
import { doc, setDoc } from 'firebase/firestore'
import { rtdb, db } from '@/firebase'

export function useRealtimePresence(usuario) {
  useEffect(() => {
    if (!usuario?.uid) return

    const uid = usuario.uid
    const statusRef = ref(rtdb, `/status/${uid}`)
    const infoConnectedRef = ref(rtdb, '.info/connected')

    // 👇 Força a conexão com o RTDB lendo um dado leve
    get(ref(rtdb, '/.info/serverTimeOffset')).then(() => {
      console.log('[presence] Conexão forçada com RTDB')
    })

    const unsubscribe = onValue(infoConnectedRef, (snap) => {
      const conectado = snap.val() === true
      console.log('[presence] .info/connected =', conectado)

      if (conectado) {
        // Ao desconectar: grava offline no RTDB e no Firestore
        onDisconnect(statusRef).set({
          state: 'offline',
          last_changed: Date.now(),
        }).then(() => {
          console.log('[presence] onDisconnect set OK')
          // Espelha no Firestore como offline
          setDoc(doc(db, 'status', uid), {
            state: 'offline',
            last_changed: Date.now(),
          }).then(() => {
            console.log('[presence] espelhado FS offline (desconectado local)')
          })
        })

        // Marca como online no RTDB
        set(statusRef, {
          state: 'online',
          last_changed: Date.now(),
        }).then(() => {
          console.log('[presence] set RTDB online OK')
          // Espelha no Firestore como online
          setDoc(doc(db, 'status', uid), {
            state: 'online',
            last_changed: Date.now(),
          }).then(() => {
            console.log('[presence] espelhado FS online OK')
          })
        })
      }
    })

    return () => unsubscribe()
  }, [usuario])
}
