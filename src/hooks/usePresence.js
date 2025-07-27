import { useEffect } from 'react'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export function usePresence(uid) {
  useEffect(() => {
    if (!uid) {
      console.warn('[usePresence] UID ausente. Presença não será registrada.')
      return
    }

    const ref = doc(db, 'usuarios', uid)
    console.log(`[usePresence] Iniciando presença para UID: ${uid}`)

    // Primeira atualização ao montar
    const atualizarPresenca = async () => {
      try {
        await updateDoc(ref, { ultimaAtividade: serverTimestamp(), status: true })
        console.log(`[usePresence] ✅ Presença registrada para UID: ${uid}`)
      } catch (err) {
        console.error('[usePresence] ❌ Erro ao registrar presença:', err)
      }
    }

    atualizarPresenca()

    const intervalo = setInterval(atualizarPresenca, 30000) // Atualiza a cada 30s

    return () => {
      clearInterval(intervalo)
      console.log(`[usePresence] ⛔ Parando presença de UID: ${uid}`)
    }
  }, [uid])
}
