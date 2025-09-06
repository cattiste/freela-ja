export async function getPaymentTokenEfipay(cardData) {
  return new Promise((resolve, reject) => {
    if (!window.getPaymentToken) {
      return reject(new Error('SDK da Efi não está carregado.'))
    }

    try {
      window.getPaymentToken(cardData, function (response) {
        if (response.code === 200) {
          resolve(response.data.payment_token)
        } else {
          console.error('[getPaymentToken] erro:', response)
          reject(new Error('Erro ao obter payment_token.'))
        }
      })
    } catch (err) {
      console.error('[getPaymentToken] exceção:', err)
      reject(new Error('Erro ao processar token de pagamento.'))
    }
  })
}
