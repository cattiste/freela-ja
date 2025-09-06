
// src/utils/efipay.js

function exists(fn) {
  return typeof fn === 'function';
}

/**
 * Espera o SDK da Efí estar pronto.
 * Considera tanto a API nova (window.EfiPay) quanto a antiga ($gn).
 */
export function efipayReady() {
  return new Promise((resolve, reject) => {
    const MAX_TRIES = 70; // ~7s
    let tries = 0;

    const check = () => {
      const hasNew = window?.EfiPay && (exists(window.EfiPay.getPaymentToken) || exists(window.EfiPay.getInstallments));
      const hasOld = window?.$gn && exists(window.$gn.ready);

      if (hasNew || hasOld) {
        if (hasOld) {
          try {
            window.$gn.ready(function (checkout) {
              if (typeof checkout.getPaymentToken === 'function') {
                resolve({ mode: 'old', gn: checkout }); // gn agora é checkout
              } else {
                reject(new Error('checkout.getPaymentToken não disponível após $gn.ready.'))
              }
            });
            return;
          } catch (e) {
            // fallback para EfiPay
          }
        }
        if (hasNew) return resolve({ mode: 'new', EfiPay: window.EfiPay });
      }

      if (tries++ < MAX_TRIES) setTimeout(check, 100);
      else reject(new Error('SDK da Efí não ficou pronto (nem EfiPay nem $gn). Verifique o <script> e o Identificador.'));
    };

    check();
  });
}

/**
 * Gera payment_token, compatível com as duas APIs.
 * cardData: { number, cvv, expiration_month, expiration_year, holder, brand? }
 */
export async function getPaymentTokenEfipay(cardData) {
  const ctx = await efipayReady();

  // API nova
  if (ctx.mode === 'new' && exists(ctx.EfiPay.getPaymentToken)) {
    try {
      const token = await ctx.EfiPay.getPaymentToken(cardData);
      if (!token) throw new Error('Token vazio retornado pela EfiPay.');
      return token;
    } catch (e) {
      throw new Error(e?.message || 'Falha ao tokenizar (EfiPay.getPaymentToken).');
    }
  }

  // API antiga ($gn) - agora usando checkout direto
  return new Promise((resolve, reject) => {
    try {
      ctx.gn.getPaymentToken(cardData, (resp) => {
        if (resp?.error) {
          reject(new Error(resp?.message || 'Falha ao tokenizar ($gn.getPaymentToken).'));
        } else {
          resolve(resp?.data?.payment_token || resp?.payment_token);
        }
      });
    } catch (e) {
      reject(new Error(e?.message || 'Erro ao chamar $gn.getPaymentToken.'));
    }
  });
}

/**
 * (Opcional) parcelas – compatível com as duas APIs
 */
export async function getInstallmentsEfipay(params = {}) {
  const ctx = await efipayReady();

  if (ctx.mode === 'new' && exists(ctx.EfiPay.getInstallments)) {
    try {
      return await ctx.EfiPay.getInstallments(params);
    } catch (e) {
      throw new Error(e?.message || 'Falha ao obter parcelas (EfiPay).');
    }
  }

  return new Promise((resolve, reject) => {
    try {
      ctx.gn.getInstallments(params, (resp) => {
        if (resp?.error) reject(new Error(resp?.message || 'Falha ao obter parcelas ($gn).'));
        else resolve(resp);
      });
    } catch (e) {
      reject(new Error(e?.message || 'Erro ao chamar $gn.getInstallments.'));
    }
  });
}
