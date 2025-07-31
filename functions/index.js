// Funções Firebase com pagarFreelaAoCheckout integrado

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const Gerencianet = require('gn-api-sdk-node')
const dotenv = require('dotenv')
dotenv.config()

admin.initializeApp()
const db = admin.firestore()

const gn = new Gerencianet({
  client_id: process.env.GN_CLIENT_ID,
  client_secret: process.env.GN_CLIENT_SECRET,
  sandbox: true
})

exports.pagarFreelaAoCheckout = functions.https.onCall(async (data, context) => {
  const { chamadaId } = data

  try {
    const chamadaSnap = await db.collection('chamadas').doc(chamadaId).get()
    if (!chamadaSnap.exists) throw new Error('Chamada não encontrada')

    const chamada = chamadaSnap.data()
    const { freelaUid, valorDiaria } = chamada

    const userSnap = await db.collection('usuarios').doc(freelaUid).get()
    if (!userSnap.exists) throw new Error('Freela não encontrado')

    const freela = userSnap.data()
    const chavePix = freela?.dadosBancarios?.chavePix

    if (!chavePix) throw new Error('Freela não possui chave Pix cadastrada')

    const valorTransferencia = Number(valorDiaria) * 0.9

    const body = {
      valor: {
        original: valorTransferencia.toFixed(2)
      },
      chave: chavePix,
      solicitacaoPagador: 'Pagamento por serviço realizado na FreelaJá'
    }

    const res = await gn.pixSend({ id: chamadaId }, body)

    await db.collection('pagamentos').doc(chamadaId).update({
      status: 'pago',
      pixConfirmado: true,
      dataPagamento: admin.firestore.FieldValue.serverTimestamp(),
      comprovante: res.endToEndId
    })

    return { ok: true, comprovante: res.endToEndId }
  } catch (error) {
    console.error('Erro ao pagar freela:', error.response?.data || error)
    throw new functions.https.HttpsError('internal', 'Erro ao pagar freela')
  }
})
exports.cobraChamadaAoAceitar = functions.https.onCall(async (data, context) => {
  const { chamadaId, valorDiaria, nomeEstabelecimento, cpfEstabelecimento } = data

  const valorTotal = Number(valorDiaria) * 1.10

  const body = {
    calendario: { expiracao: 3600 },
    devedor: { nome: nomeEstabelecimento, cpf: cpfEstabelecimento },
    valor: { original: valorTotal.toFixed(2) },
    chave: process.env.GN_PIX_KEY,
    solicitacaoPagador: 'Pagamento FreelaJá - Chamada'
  }

  try {
    const charge = await gn.pixCreateImmediateCharge([], body)
    const qrCode = await gn.pixGenerateQRCode({ id: charge.loc.id })

    await db.collection('pagamentos').doc(chamadaId).set({
      chamadaId,
      valorBase: Number(valorDiaria),
      valorTotal,
      valorFreela: Number(valorDiaria) * 0.9,
      valorPlataforma: Number(valorDiaria) * 0.2,
      tipo: 'pix',
      txid: charge.txid,
      imagemQrcode: qrCode.imagemQrcode,
      qrcode: qrCode.qrcode,
      status: 'pendente',
      criadoEm: admin.firestore.FieldValue.serverTimestamp()
    })

    return {
      imagem: qrCode.imagemQrcode,
      qrcode: qrCode.qrcode,
      txid: charge.txid
    }

  } catch (err) {
    console.error('Erro ao criar cobrança Pix:', err.response?.data || err)
    throw new functions.https.HttpsError('internal', 'Erro ao criar cobrança Pix')
  }
})
