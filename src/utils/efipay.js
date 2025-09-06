// src/utils/efipay.js

import { loadEfipayScript } from './loadEfipayScript'

export async function getPaymentTokenEfipay(cardData) {
  return new Promise(async (resolve, reject) => {
    try {
      const $gn = await loadEfipayScript()

      if (!$gn || typeof $gn.ready !== 'function') {
        return reject(new Error('SDK Efi não inicializada corretamente.'))
      }

      $gn.ready((checkout) => {
        if (!checkout || typeof checkout.getPaymentToken !== 'function') {
          return reject(new Error('Função getPaymentToken não disponível no checkout.'))
        }

        checkout.getPaymentToken(cardData, (res) => {
          if (res.error) {
            return reject(new Error(res.message || 'Erro desconhecido ao gerar token.'))
          }

          resolve(res.payment_token || res.data?.payment_token)
        })
      })
    } catch (e) {
      reject(e)
    }
  })
}
