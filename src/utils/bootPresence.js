// src/utils/bootPresence.js
import { auth, db } from '@/firebase'
import { getDatabase, ref, set, onDisconnect } from 'firebase/database'
import { doc, getDoc } from 'firebase/firestore'

export async function bootPresence() {
  const user = auth.currentUser
  if (!user) return
  const rtdb = getDatabase()

  // pega dados normalizados
  const uref = doc(db, 'usuarios', user.uid)
  const snap = await getDoc(uref)
  const u = snap.exists() ? snap.data() : {}

  const statusRef = ref(rtdb, `status/${user.uid}`)
  const payload = {
    online: true,
    ultimaAtividade: Date.now(),
    tipoConta: u.tipoConta || null,
    tipoUsuario: u.tipoUsuario || null,
  }

  await set(statusRef, payload)
  onDisconnect(statusRef).set({ ...payload, online: false, ultimaAtividade: Date.now() })
}
