// src/utils/bootPresence.js
// Grava presença do usuário logado no RTDB em /status/{uid}
// Inclui tipoConta/tipoUsuario/subtipoComercial (compat legado)
import { auth, db } from '@/firebase'
import { getDatabase, ref, set, onDisconnect } from 'firebase/database'
import { doc, getDoc } from 'firebase/firestore'

export async function bootPresence() {
  const user = auth.currentUser
  if (!user) return

  const rtdb = getDatabase()
  const uref = doc(db, 'usuarios', user.uid)
  const snap = await getDoc(uref)
  const u = snap.exists() ? snap.data() : {}

  const tipoConta = u?.tipoConta ?? (u?.tipo === 'freela' ? 'funcional' : u?.tipo ? 'comercial' : null)
  const tipoUsuario = u?.tipoUsuario ?? (u?.tipo === 'freela' ? 'freela' : null)
  const subtipoComercial =
    u?.subtipoComercial ?? (u?.tipo === 'contratante' ? 'contratante' : u?.tipo === 'pessoa_fisica' ? 'pf' : null)

  const statusRef = ref(rtdb, `status/${user.uid}`)
  const base = {
    online: true,
    ultimaAtividade: Date.now(),
    tipoConta, tipoUsuario, subtipoComercial,
  }

  await set(statusRef, base)
  onDisconnect(statusRef).set({ ...base, online: false, ultimaAtividade: Date.now() })
}
