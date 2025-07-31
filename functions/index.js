const functions = require('firebase-functions')
const admin = require('firebase-admin')
const Gerencianet = require('gn-api-sdk-node')
const dotenv = require('dotenv')
dotenv.config()

admin.initializeApp()
const db = admin.firestore()

const options = {
  client_id: process.env.GN_CLIENT_ID,
  client_secret: process.env.GN_CLIENT_SECRET,
  sandbox: true // ❗ true para testes, false para produção
}

const gn = new Gerencianet(options)

// Função de teste Pix genérico
exports.gerarCobrancaPix = functions.https.onCall(async (data, context) => {
  const { nome, cpf, valor, descricao } = data

  const body = {
    calendario: { expiracao: 3600 },
    devedor: { nome, cpf },
    valor: { original: valor.toFixed(2) },
    chave: process.env.GN_PIX_KEY,
    solicitacaoPagador: descricao
  }

  try {
    const res = await gn.pixCreateImmediateCharge([], body)
    const locId = res.loc.id
    const qrCode = await gn.pixGenerateQRCode({ id: locId })

    return {
      txid: res.txid,
      qrCode: qrCode.qrcode,
      imagem: qrCode.imagemQrcode
    }
  } catch (err) {
    console.error('Erro ao gerar cobrança:', err.response?.data || err)
    throw new functions.https.HttpsError('internal', 'Erro ao gerar cobrança Pix')
  }
})

// Função principal do fluxo: cobrança da chamada ao aceitar
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

    // Salva no Firestore
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
