
// functions/cobrarCartaoAoAceitar.js
const axios = require('axios')
const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

exports.cobrarCartaoAoAceitar = functions.https.onRequest(async (req, res) => {
  try {
    const {
      chamadaId,
      valorDiaria,
      nome,
      cpf,
      email,
      telefone,
      payment_token
    } = req.body

    if (!chamadaId || !valorDiaria || !payment_token) {
      return res.status(400).json({ erro: 'Dados incompletos.' })
    }

    const valorFinal = Math.round(valorDiaria * 1.1 * 100) // R$ → centavos + 10% taxa
    const valorRecebedor = Math.round(valorDiaria * 0.9 * 100) // 90% pro freela
    const valorComissao = valorFinal - valorRecebedor // 10% retido

    // Dados para o split (precisa do ID da conta do freela futuramente)
    const split_items = [
      {
        recipient_token: functions.config().gn.freela_token, // <-- substitua por ID do freela no Gerencianet
        percentage: 90
      },
      {
        recipient_token: functions.config().gn.plataforma_token, // <-- token da plataforma
        percentage: 10
      }
    ]

    const payload = {
      items: [
        {
          name: `Pagamento da chamada ${chamadaId}`,
          value: valorFinal,
          amount: 1
        }
      ],
      payment: {
        credit_card: {
          payment_token,
          billing_address: {
            street: 'Rua Exemplo',
            number: 123,
            neighborhood: 'Centro',
            zipcode: '12345678',
            city: 'São Paulo',
            state: 'SP'
          },
          customer: {
            name,
            cpf,
            email,
            phone_number: telefone
          }
        }
      },
      split: split_items
    }

    const response = await axios.post(
      'https://api.gerencianet.com.br/v1/charge/one-step',
      payload,
      {
        headers: {
          Authorization: `Bearer ${functions.config().gn.token}`,
          'Content-Type': 'application/json'
        }
      }
    )

    await admin.firestore().collection('pagamentos').doc(chamadaId).set({
      status: 'pago',
      metodo: 'cartao',
      valorFinal,
      criadoEm: admin.firestore.FieldValue.serverTimestamp()
    })

    return res.status(200).json({ ok: true, dados: response.data })
  } catch (err) {
    console.error('Erro cobrança cartão:', err?.response?.data || err.message)
    return res.status(500).json({ erro: 'Erro ao processar cobrança.' })
  }
})
