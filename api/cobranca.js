// /api/cobranca.js
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  const url = process.env.COBRANCA_FUNCTION_URL
  if (!url) {
    return res.status(500).json({ erro: 'COBRANCA_FUNCTION_URL não configurada' })
  }

  try {
    const forward = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body || {})
    })

    const data = await forward.json().catch(() => ({}))

    // A tua função retorna { imagem: <base64 do QR> } quando ok
    if (forward.ok) {
      return res.status(200).json(data)
    }

    // Erro vindo da Function
    return res.status(forward.status || 502).json({
      erro: 'Falha na cobrança',
      detalhe: data?.error || data
    })
  } catch (err) {
    console.error('[proxy cobranca] erro:', err)
    return res.status(500).json({ erro: 'Falha ao contatar a Function' })
  }
}
