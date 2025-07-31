const functions = require('firebase-functions')
const Gerencianet = require('gn-api-sdk-node')
const dotenv = require('dotenv')
dotenv.config()

const options = {
  client_id: process.env.GN_CLIENT_ID,
  client_secret: process.env.GN_CLIENT_SECRET,
  sandbox: true, // Coloque false no ambiente de produção
}

const gn = new Gerencianet(options)

exports.gerarCobrancaPix = functions.https.onCall(async (data, context) => {
  const { nome, cpf, valor, descricao } = data

  const body = {
    calendario: { expiracao: 3600 },
    devedor: { nome, cpf },
    valor: { original: valor.toFixed(2) },
    chave: process.env.GN_PIX_KEY,
    solicitacaoPagador: descricao,
  }

  try {
    const res = await gn.pixCreateImmediateCharge([], body)
    const locId = res.loc.id
    const qrCode = await gn.pixGenerateQRCode({ id: locId })

    return {
      txid: res.txid,
      qrCode: qrCode.qrcode,
      imagem: qrCode.imagemQrcode,
    }
  } catch (err) {
    console.error('Erro ao gerar cobrança:', err.response && err.response.data ? err.response.data : err)
    throw new functions.https.HttpsError('internal', 'Erro ao gerar cobrança Pix')
  }
})
