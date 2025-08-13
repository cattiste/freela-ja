// src/hooks/useRealtimePresence.js
import { useEffect } from 'react'
import { rtdb, db } from '@/firebase'
import {
  ref,
  onValue,
  onDisconnect,
  set,
  get,
  serverTimestamp as rtdbNow,
} from 'firebase/database'
import {
  doc,
  setDoc,
  serverTimestamp as fsNow,
} from 'firebase/firestore'

/**
 * Presença em tempo real (RTDB) com espelho no Firestore.
 * - Marca online ao entrar, offline ao desconectar/minimizar/fechar.
 * - Força a conexão do RTDB para evitar precisar dar F5.
 * - Protege contra UID inválido (evita "Invalid token in path").
 */
export function useRealtimePresence(usuario) {
  useEffect(() => {
    // 1) Checagens iniciais
    if (!usuario?.uid || typeof usuario.uid !== 'string') return
    const rawUid = usuario.uid.trim()
    // caracteres proibidos em paths do RTDB: . # $ [ ]
    if (/[.#$\[\]]/.test(rawUid)) {
      console.warn('[presence] UID contém caracteres inválidos para RTDB:', rawUid)
      return
    }

    const uid = rawUid
    const statusPath = `status/${uid}` // sem barra inicial para evitar confusão
    let statusRef
    try {
      statusRef = ref(rtdb, statusPath)
    } catch (e) {
      console.error('[presence] erro ao criar ref do RTDB:', e)
      return
    }

    const infoConnectedRef = ref(rtdb, '.info/connected')
    let mounted = true
    let visTimer = null

    // 2) Força a conexão do RTDB com uma leitura leve
    get(ref(rtdb, '.info/serverTimeOffset'))
      .then(() => console.log('[presence] RTDB “warmed up”'))
      .catch(() => {/* silencioso */})

    // 3) Funções utilitárias
    const setRTDB = (data) => set(statusRef, data)
    const setFS = (data) =>
      setDoc(doc(db, 'status', uid), data, { merge: true })

    const goOnline = async () => {
      try {
        // programa offline automático no disconnect
        await onDisconnect(statusRef).set({
          state: 'offline',
          last_changed: rtdbNow(),
        })
        // marca online agora (RTDB + FS)
        await setRTDB({ state: 'online', last_changed: rtdbNow() })
        await setFS({ state: 'online', last_changed: fsNow() })
        // console.log('[presence] online OK')
      } catch (e) {
        console.error('[presence] erro ao marcar online:', e)
      }
    }

    const goOffline = async () => {
      try {
        await setRTDB({ state: 'offline', last_changed: rtdbNow() })
        await setFS({ state: 'offline', last_changed: fsNow() })
        // console.log('[presence] offline OK')
      } catch (e) {
        // silencioso para não poluir
      }
    }

    // 4) Observa a conexão do RTDB
    const unsubscribe = onValue(infoConnectedRef, async (snap) => {
      if (!mounted) return
      const connected = snap.val() === true
      // console.log('[presence] .info/connected =', connected)

      if (!connected) {
        // Sem conexão com RTDB: já espelha offline no FS (opcional)
        try {
          await setFS({ state: 'offline', last_changed: fsNow() })
        } catch (_) {}
        return
      }

      // Conectado: entra online
      await goOnline()
    })

    // 5) Visibilidade da aba: ocultou → offline, voltou → online
    const handleVisibility = () => {
      if (visTimer) clearTimeout(visTimer)
      visTimer = setTimeout(async () => {
        if (!mounted) return
        if (document.visibilityState === 'hidden') {
          await goOffline()
        } else {
          // Ao voltar visível, garante que estamos online
          await goOnline()
        }
      }, 150) // debounce curto
    }
    document.addEventListener('visibilitychange', handleVisibility)

    // 6) Cleanup
    return () => {
      mounted = false
      if (visTimer) clearTimeout(visTimer)
      document.removeEventListener('visibilitychange', handleVisibility)
      unsubscribe()
      // onDisconnect já está armado no servidor; não precisa desfazer manualmente.
    }
  }, [usuario?.uid])
}
