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

// ✅ Função 1: Envia pagamento para o freela
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

// ✅ Função 2: Gera QR Code Pix para o contratante e salva confirmação
exports.cobraChamadaAoAceitar = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Método não permitido')
  }

  const {
    chamadaId,
    valorDiaria,
    nomeEstabelecimento,
    cpfEstabelecimento,
    cnpjEstabelecimento,
    cpfResponsavel,
    documentoManual
  } = req.body

  try {
    const valor = Number(valorDiaria)
    if (!valor || !chamadaId || !nomeEstabelecimento) {
      throw new Error('Dados incompletos para cobrança')
    }

    const documento = documentoManual || cpfEstabelecimento || cnpjEstabelecimento
    if (!documento) throw new Error('Documento não informado')

    const txid = chamadaId
    const body = {
      calendario: { expiracao: 3600 },
      valor: { original: valor.toFixed(2) },
      chave: process.env.CHAVE_PIX_PLATAFORMA,
      solicitacaoPagador: `Pagamento para chamada ${chamadaId}`,
      infoAdicionais: [{ nome: 'Estabelecimento', valor: nomeEstabelecimento }]
    }

    const response = await gn.pixCreateImmediateCharge({ txid }, body)
    const loc = response.loc.id
    const qrCode = await gn.pixGenerateQRCode({ id: loc })

    await db.collection('chamadas').doc(chamadaId).update({
      status: 'pago',
      pagamentoConfirmado: true,
      pagoEm: admin.firestore.FieldValue.serverTimestamp(),
      imagemQrcode: qrCode.imagemQrcode
    })

    return res.status(200).json({ imagem: qrCode.imagemQrcode })
  } catch (error) {
    console.error('Erro ao gerar cobrança Pix:', error.response?.data || error)
    return res.status(500).json({ error: 'Erro ao gerar cobrança Pix' })
  }
})
