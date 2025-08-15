// src/utils/criarChamada.js
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export async function criarChamada(estabelecimento, freela, vaga) {
  try {
    await addDoc(collection(db, 'chamadas'), {
      estabelecimentoUid: estabelecimento.uid,
      estabelecimentoNome: estabelecimento.nome,
      freelaUid: freela.uid,
      freelaNome: freela.nome,
      vagaTitulo: vaga?.titulo || 'Vaga sem título',
      status: 'pendente',
      criadoEm: serverTimestamp(),
    })
    alert('Chamada criada com sucesso!')
  } catch (error) {
    console.error('Erro ao criar chamada:', error)
    alert('Erro ao criar chamada. Veja o console para detalhes.')
  }
}
