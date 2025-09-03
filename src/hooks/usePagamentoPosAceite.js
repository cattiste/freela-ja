import { getFunctions, httpsCallable } from 'firebase/functions'
import { confirmarPagamentoELiberar, setPixAguardando } from '@/services/chamadasService'

const functionsClient = getFunctions(undefined, 'southamerica-east1')

export function usePagamentoPosAceite() {
  async function pagarCartaoAposAceite(ch) {
    const senha = window.prompt('Senha de pagamento:')
    if (!senha) return

    await httpsCallable(functionsClient, 'confirmarPagamentoComSenha')({ senha })
    const valor = Number((ch.valorDiaria * 1.10).toFixed(2))
    const cobrar = httpsCallable(functionsClient, 'cobrarCartaoAposAceite')
    const res = await cobrar({ chamadaId: ch.id, valor, senha })
    if (!res?.data?.sucesso) throw new Error(res?.data?.erro || 'Falha no cartão')

    await httpsCallable(functionsClient, 'registrarPagamentoEspelho')({
      chamadaId: ch.id, valor, metodo: 'cartao', tipo: 'captura_pos_aceite'
    })

    await confirmarPagamentoELiberar(ch)
  }

  async function gerarPixAposAceite(ch) {
    const valor = Number((ch.valorDiaria * 1.10).toFixed(2))
    const gerar = httpsCallable(functionsClient, 'gerarPixAposAceite')
    const res = await gerar({ chamadaId: ch.id, valor })
    if (!res?.data?.sucesso) throw new Error(res?.data?.erro || 'Erro ao gerar Pix')
    await setPixAguardando(ch, { imagemQrCode: res.data.imagemQrCode, qrCode: res.data.qrCode })
  }

  return { pagarCartaoAposAceite, gerarPixAposAceite }
}