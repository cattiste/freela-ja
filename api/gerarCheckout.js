export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  const { titulo, valor, referenciaId, tipo } = req.body

  if (!titulo || !valor || !referenciaId || !tipo) {
    return res.status(400).json({ erro: 'Dados incompletos' })
  }

  try {
    const response = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from('SUA_CHAVE_SECRETA:').toString('base64')}`, // substitua pela sua chave
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [
          {
            name: titulo,
            quantity: 1,
            unit_amount: parseInt(valor * 100)
          }
        ],
        payments: [
          {
            payment_method: 'pix'
          }
        ],
        metadata: {
          tipo,            // 'evento' ou 'chamada'
          referenciaId     // pode ser o ID do evento ou da chamada
        }
      })
    })

    const data = await response.json()

    if (data.checkout_url) {
      return res.status(200).json({ linkPagamento: data.checkout_url })
    } else {
      console.error('[PAGARME] Erro na resposta:', data)
      return res.status(500).json({ erro: 'Erro ao gerar link de pagamento' })
    }

  } catch (err) {
    console.error('[PAGARME] Erro de conexão:', err)
    return res.status(500).json({ erro: 'Erro ao conectar com a Pagar.me' })
  }
}
