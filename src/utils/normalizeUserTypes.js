// src/utils/normalizeUserTypes.js
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export async function normalizeUserTypes() {
  const uid = auth.currentUser?.uid
  if (!uid) return
  const ref = doc(db, 'usuarios', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return
  const u = snap.data()

  if (u.tipoConta || u.tipoUsuario || u.subtipoComercial) return

  const patch = {}
  switch (u.tipo) {
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
      // se não tem 'tipo', não força nada
      return
  }

  try {
    await updateDoc(ref, patch)
    
  } catch (e) {
    console.error('normalizeUserTypes error:', e)
  }
}
