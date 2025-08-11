// src/utils/normalizeUserTypes.js
// Migra documentos antigos (campo 'tipo') para o novo modelo
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

export async function normalizeUserTypes() {
  const uid = auth.currentUser?.uid
  if (!uid) return

  const ref = doc(db, 'usuarios', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const u = snap.data()
  if (u?.tipoConta || u?.tipoUsuario || u?.subtipoComercial) return

  const patch = {}
  switch (u?.tipo) {
    case 'freela':
      patch.tipoConta = 'funcional'
      patch.tipoUsuario = 'freela'
      break
    case 'estabelecimento':
      patch.tipoConta = 'comercial'
      patch.subtipoComercial = 'estabelecimento'
      break
    case 'pessoa_fisica':
      patch.tipoConta = 'comercial'
      patch.subtipoComercial = 'pf'
      break
    default:
      return
  }

  try {
    await updateDoc(ref, { ...patch, normalizadoEm: serverTimestamp() })
  } catch (e) {
    console.error('normalizeUserTypes error:', e)
  }
}
