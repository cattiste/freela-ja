// src/utils/efipay.js

function exists(fn) {
  return typeof fn === 'function';
}

function hasOldCheckout() {
  return (
    typeof window !== 'undefined' &&
    window.$gn &&
    window.$gn.checkout &&
    exists(window.$gn.checkout.getPaymentToken)
  );
}

/**
 * Espera o SDK da Efí ficar pronto (cobre todas as variantes).
 */
export function efipayReady() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const MAX_TRIES = 100; // ~10s

    const okNew = () =>
      typeof window !== 'undefined' &&
      window.EfiPay &&
      (exists(window.EfiPay.getPaymentToken) || exists(window.EfiPay.getInstallments));

    const okOldImmediate = () =>
      typeof window !== 'undefined' &&
      window.$gn &&
      exists(window.$gn.ready);

    const tick = () => {
      // API nova
      if (okNew()) {
        return resolve({ mode: 'new', EfiPay: window.EfiPay });
      }

      // API antiga: já tem $gn.ready disponível
      if (okOldImmediate()) {
        try {
          window.$gn.ready(function (checkoutMaybe) {
            // 1) Variante que passa "checkout"
            if (checkoutMaybe && exists(checkoutMaybe.getPaymentToken)) {
              return resolve({ mode: 'old', gn: checkoutMaybe });
            }
            // 2) Variante sem parâmetro: usa $gn.checkout
            if (hasOldCheckout()) {
              return resolve({ mode: 'old', gn: window.$gn.checkout });
            }
            // 3) Ainda não populou: dá mais tentativas curtas
            let innerTries = 0;
            const inner = setInterval(() => {
              if (hasOldCheckout()) {
                clearInterval(inner);
                return resolve({ mode: 'old', gn: window.$gn.checkout });
              }
              if (++innerTries > 30) { // +3s
                clearInterval(inner);
                reject(new Error('checkout.getPaymentToken não disponível após $gn.ready.'));
              }
            }, 100);
          });
          return;
        } catch (e) {
          // segue tentando
        }
      }

      if (++tries > MAX_TRIES) {
        return reject(new Error('SDK da Efí não ficou pronto (nem EfiPay nem $gn). Verifique o <script> e o Identificador.'));
      }
      setTimeout(tick, 100);
    };

    tick();
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
    const token = await ctx.EfiPay.getPaymentToken(cardData);
    if (!token) throw new Error('Token vazio retornado pela EfiPay.');
    return token;
  }

  // API antiga ($gn): ctx.gn sempre terá getPaymentToken
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
    return await ctx.EfiPay.getInstallments(params);
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
