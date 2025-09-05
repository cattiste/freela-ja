import { getFunctions, httpsCallable } from 'firebase/functions'
import { confirmarPagamentoELiberar, setPixAguardando } from '@/services/chamadasService'

const functionsClient = getFunctions(undefined, 'southamerica-east1')

export function usePagamentoPosAceite() {
  async function pagarCartaoAposAceite(ch) {
    try {
      const valor = Number((ch.valorDiaria * 1.10).toFixed(2))
      const cobrar = httpsCallable(functionsClient, 'cobrarCartaoAposAceite')

      const res = await cobrar({
        uidContratante: ch.contratanteUid,
        valorTotal: valor,
        descricao: `Pagamento da chamada #${ch.id}`
      })

      if (!res?.data?.sucesso) {
        throw new Error(res?.data?.erro || 'Erro ao cobrar cartão.')
      }

      // Espelha no Firestore
      await httpsCallable(functionsClient, 'registrarPagamentoEspelho')({
        chamadaId: ch.id,
        valor,
        metodo: 'cartao',
        tipo: 'captura_pos_aceite'
      })

      // Libera o check-in e endereço
      await confirmarPagamentoELiberar(ch)
    } catch (err) {
      console.error('Erro no pagamento com cartão:', err)
      alert(err.message || 'Erro inesperado no pagamento.')
    }
  }

  async function gerarPixAposAceite(ch) {
    try {
      const valor = Number((ch.valorDiaria * 1.10).toFixed(2))
      const gerar = httpsCallable(functionsClient, 'gerarPixCallable')
      const res = await gerar({ chamadaId: ch.id, valor })

      if (!res?.data?.sucesso) throw new Error(res?.data?.erro || 'Erro ao gerar Pix')

      await setPixAguardando(ch, {
        imagemQrCode: res.data.imagemQrCode,
        qrCode: res.data.qrCode
      })
    } catch (err) {
      console.error('Erro ao gerar Pix:', err)
      alert(err.message || 'Erro inesperado ao gerar Pix.')
    }
  }

  return { pagarCartaoAposAceite, gerarPixAposAceite }
}
