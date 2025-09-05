// src/utils/efipay.js
export function efipayReady() {
  return new Promise((resolve, reject) => {
    const MAX_TRIES = 50; // ~5s
    let tries = 0;
    const wait = () => {
      const gn = window?.$gn
      if (gn && typeof gn.ready === 'function') {
        try {
          gn.ready(() => resolve(gn))
        } catch (e) {
          reject(e)
        }
      } else if (tries++ < MAX_TRIES) {
        setTimeout(wait, 100)
      } else {
        reject(new Error('SDK da Efí não carregou. Confira o <script> no index.html e o Identificador de Conta.'))
      }
    }
    wait()
  })
}

export async function getPaymentTokenEfipay(cardData) {
  const gn = await efipayReady()
  return new Promise((resolve, reject) => {
    gn.getPaymentToken(cardData, (resp) => {
      if (resp?.error) reject(new Error(resp?.message || 'Falha ao tokenizar'))
      else resolve(resp?.data?.payment_token || resp?.payment_token)
    })
  })
}
