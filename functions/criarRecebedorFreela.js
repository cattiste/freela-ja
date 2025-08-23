const functions = require('firebase-functions')
const admin = require('firebase-admin')
const axios = require('axios')
const cors = require('cors')({ origin: true })

admin.initializeApp()
const db = admin.firestore()

// 🔐 Config: tokens da plataforma
const CLIENT_ID = functions.config().gn.client_id
const CLIENT_SECRET = functions.config().gn.client_secret

// 🔄 Gera o access_token da plataforma
async function gerarTokenPlataforma() {
  const body = {
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET
  }

  const response = await axios.post(
    'https://api.gerencianet.com.br/v1/authorize',
    body,
    { headers: { 'Content-Type': 'application/json' } }
  )

  return response.data?.access_token
}

// 🚀 Função principal
exports.criarRecebedorFreela = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    try {
      const { uid } = req.body
      if (!uid) return res.status(400).json({ sucesso: false, erro: 'UID não informado' })

      const userRef = db.collection('usuarios').doc(uid)
      const userSnap = await userRef.get()

      if (!userSnap.exists) return res.status(404).json({ sucesso: false, erro: 'Freela não encontrado' })

      const dados = userSnap.data()
      const dadosBancarios = dados.dadosBancarios || {}

      if (!dadosBancarios.cpf || !dadosBancarios.chavePix) {
        return res.status(400).json({ sucesso: false, erro: 'Dados bancários incompletos' })
      }

      // Gera token da plataforma
      const access_token = await gerarTokenPlataforma()

      // Monta payload da criação do recebedor
      const payload = {
        tipo: 'pf',
        cpf: dadosBancarios.cpf.replace(/\D/g, ''),
        nome: dados.nome,
        email: dados.email,
        chavepix: dadosBancarios.chavePix,
        conta: {
          tipo: dadosBancarios.tipoConta || 'corrente',
          agencia: dadosBancarios.agencia,
          conta: dadosBancarios.conta,
          banco: dadosBancarios.banco
        }
      }

      const response = await axios.post(
        'https://api.gerencianet.com.br/v1/recebedores',
        payload,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      const tokenFreela = response.data?.recebedor?.id

      if (!tokenFreela) {
        return res.status(500).json({ sucesso: false, erro: 'Token do freela não recebido' })
      }

      await userRef.update({ gn_recebedor_token: tokenFreela })

      return res.json({ sucesso: true, token: tokenFreela })

    } catch (erro) {
      console.error('[criarRecebedorFreela] Erro geral:', erro?.response?.data || erro.message)
      return res.status(500).json({
        sucesso: false,
        erro: erro?.response?.data || erro.message
      })
    }
  })
})
