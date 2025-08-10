// src/utils/normalizeUserTypes.js
// Migra documentos antigos (campo 'tipo') para o novo modelo:
// - freela           -> tipoConta: 'funcional', tipoUsuario: 'freela'
// - estabelecimento  -> tipoConta: 'comercial', subtipoComercial: 'estabelecimento'
// - pessoa_fisica    -> tipoConta: 'comercial', subtipoComercial: 'pf'
import { auth, db } from '@/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'

export async function normalizeUserTypes() {
  const uid = auth.currentUser?.uid
  if (!uid) return

  const ref = doc(db, 'usuarios', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return

  const u = snap.data()

  // Já normalizado?
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
      // Se não tiver 'tipo' antigo, não força nada
      return
  }

  try {
    await updateDoc(ref, patch)
    // console.log('normalizeUserTypes ok', patch)
  } catch (e) {
    console.error('normalizeUserTypes error:', e)
  }
}
