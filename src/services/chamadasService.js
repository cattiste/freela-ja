import { db } from '@/firebase'
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { PAGAMENTO_STATUS, CHAMADA_STATUS } from '@/constants/chamadaStatus'

const ref = (id) => doc(db, 'chamadas', id)

export async function marcarAceita(ch) {
  await updateDoc(ref(ch.id), {
    status: CHAMADA_STATUS.ACEITA,
    aceitaEm: serverTimestamp()
  })
}

export async function confirmarPagamentoELiberar(ch) {
  await updateDoc(ref(ch.id), {
    status: CHAMADA_STATUS.CONFIRMADA,
    liberarEnderecoAoFreela: true,
    confirmadaEm: serverTimestamp(),
    pagamento: { ...(ch.pagamento || {}), status: PAGAMENTO_STATUS.CONFIRMADO }
  })
}

export async function setPixAguardando(ch, { imagemQrCode, qrCode }) {
  await updateDoc(ref(ch.id), {
    pagamento: {
      metodo: 'pix',
      status: PAGAMENTO_STATUS.AGUARDANDO_PIX,
      valor: Number((ch.valorDiaria * 1.10).toFixed(2)),
      qrCodePix: imagemQrCode || null,
      copiaColaPix: qrCode || null
    }
  })
}

export async function confirmarCheckInFreelaPeloContratante(ch) {
  await updateDoc(ref(ch.id), {
    status: CHAMADA_STATUS.EM_ANDAMENTO,
    checkInConfirmadoPeloEstab: true,
    checkInConfirmadoPeloEstabHora: serverTimestamp(),
  })
}

export async function confirmarCheckOutFreelaPeloContratante(ch) {
  await updateDoc(ref(ch.id), {
    status: CHAMADA_STATUS.CONCLUIDO,
    checkOutConfirmadoPeloEstab: true,
    checkOutConfirmadoPeloEstabHora: serverTimestamp(),
  })
}