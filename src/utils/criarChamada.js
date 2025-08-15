import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export async function criarChamada({ contratante, freela }) {
  if (!contratante?.uid || !freela?.id) {
    throw new Error('Dados incompletos para chamada')
  }

  const id = `${contratante.uid}_${Date.now()}`
  const chamada = {
    idPersonalizado: id,
    contratanteUid: contratante.uid,
    contratanteNome: contratante.nome || '',
    freelaUid: freela.id,
    freelaNome: freela.nome || '',
    freelaFoto: freela.foto || '',
    valorDiaria: typeof freela.valorDiaria === 'number' ? freela.valorDiaria : null,
    status: 'pendente',
    criadoEm: serverTimestamp(),
  }

  await setDoc(doc(db, 'chamadas', id), chamada)
}
