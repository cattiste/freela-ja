// /api/gerarCheckout.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  try {
    const { titulo, valor, referenciaId, tipo } = req.body || {}
    if (!titulo || !valor || !referenciaId || !tipo) {
      return res.status(400).json({ erro: 'Dados incompletos' })
    }

    const secret = process.env.PAGARME_SECRET_KEY
    if (!secret) {
      return res.status(500).json({ erro: 'Chave da Pagar.me não configurada' })
    }

    const resp = await fetch('https://api.pagar.me/core/v5/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${secret}:`).toString('base64')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        items: [{ name: titulo, quantity: 1, unit_amount: Math.round(Number(valor) * 100) }],
        payments: [{ payment_method: 'pix' }],
        metadata: { tipo, referenciaId }
      })
    })

    const data = await resp.json()

    // Ajuste conforme o payload retornado pela API:
    // muitos fluxos PIX retornam objeto de QRCode em vez de "checkout_url".
    const linkPagamento = data?.checkout_url || data?.charges?.[0]?.last_transaction?.qr_code_url

    if (linkPagamento) {
      return res.status(200).json({ linkPagamento, raw: data })
    }
    console.error('[PAGARME] Resposta inesperada:', data)
    return res.status(502).json({ erro: 'Erro ao gerar link de pagamento' })
  } catch (err) {
    console.error('[PAGARME] Falha geral:', err)
    return res.status(500).json({ erro: 'Erro ao conectar com a Pagar.me' })
  }
}
