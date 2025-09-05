export function efipayReady() {
  return new Promise((resolve, reject) => {
    const MAX_TRIES = 50; // ~5s (50 * 100ms)
    let tries = 0;

    const wait = () => {
      const gn = window && window.$gn;
      if (gn && typeof gn.ready === 'function') {
        try {
          gn.ready(() => resolve(gn));
        } catch (e) {
          reject(e);
        }
      } else if (tries++ < MAX_TRIES) {
        setTimeout(wait, 100);
      } else {
        reject(
          new Error(
            'SDK da Efí não carregou. Confira o <script> no index.html e o Identificador de Conta.'
          )
        );
      }
    };

    wait();
  });
}

/**
 * Gera o payment_token com o SDK da Efí.
 * @param {{number:string, cvv:string, expiration_month:string, expiration_year:string, holder:string, brand?:string|null}} cardData
 * @returns {Promise<string>} payment_token
 */
export async function getPaymentTokenEfipay(cardData) {
  const gn = await efipayReady();
  return new Promise((resolve, reject) => {
    gn.getPaymentToken(cardData, (resp) => {
      if (resp && resp.error) {
        reject(new Error(resp.message || 'Falha ao tokenizar o cartão'));
      } else {
        resolve(resp?.data?.payment_token || resp?.payment_token);
      }
    });
  });
}

/**
 * (Opcional) Obtém parcelas pela Efí.
 * @param {{brand?:string, total?:number}} params
 * @returns {Promise<any>}
 */
export async function getInstallmentsEfipay(params = {}) {
  const gn = await efipayReady();
  return new Promise((resolve, reject) => {
    try {
      gn.getInstallments(params, (resp) => {
        if (resp && resp.error) {
          reject(new Error(resp.message || 'Falha ao obter parcelas'));
        } else {
          resolve(resp);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}