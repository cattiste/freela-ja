// src/utils/efipay.js - Versão compatível com script antigo ($gn)

/**
 * Espera o SDK antigo da Gerencianet ($gn) ficar pronto
 */
export function efipayReady() {
  return new Promise((resolve, reject) => {
    // Verifica se já está carregado (API antiga)
    if (typeof window !== 'undefined' && window.$gn && typeof window.$gn.ready === 'function') {
      return resolve(window.$gn);
    }

    let tries = 0;
    const MAX_TRIES = 50;

    const checkReady = () => {
      if (typeof window !== 'undefined' && window.$gn && typeof window.$gn.ready === 'function') {
        return resolve(window.$gn);
      }

      if (++tries > MAX_TRIES) {
        return reject(new Error('SDK da Efipay ($gn) não carregado. Verifique o script no HTML.'));
      }

      setTimeout(checkReady, 100);
    };

    checkReady();
  });
}

/**
 * Gera payment_token usando a API antiga ($gn)
 */
export async function getPaymentTokenEfipay(cardData) {
  try {
    const $gn = await efipayReady();
    
    return new Promise((resolve, reject) => {
      // A API antiga precisa do $gn.ready
      $gn.ready(function() {
        if (typeof window.$gn.getPaymentToken !== 'function') {
          return reject(new Error('getPaymentToken não disponível no SDK'));
        }

        window.$gn.getPaymentToken(cardData, (response) => {
          if (response && response.data && response.data.payment_token) {
            resolve(response.data.payment_token);
          } else if (response && response.error) {
            reject(new Error(response.error.message || 'Erro ao gerar token'));
          } else {
            reject(new Error('Resposta inválida do SDK'));
          }
        });
      });
    });
  } catch (error) {
    throw new Error(`Falha no getPaymentToken: ${error.message}`);
  }
}

/**
 * Função auxiliar para validar dados do cartão
 */
export function validarCartao(cardData) {
  const errors = [];

  if (!cardData.number || cardData.number.replace(/\s/g, '').length < 13) {
    errors.push('Número do cartão inválido');
  }

  if (!cardData.cvv || cardData.cvv.length < 3) {
    errors.push('CVV inválido');
  }

  if (!cardData.expiration_month || !cardData.expiration_year) {
    errors.push('Data de validade inválida');
  }

  if (!cardData.holder || cardData.holder.trim().length < 2) {
    errors.push('Nome do titular inválido');
  }

  if (!cardData.brand) {
    errors.push('Bandeira do cartão não selecionada');
  }

  return errors;
}

/**
 * Função para detectar bandeira do cartão pelo número
 */
export function detectarBandeira(numeroCartao) {
  const num = numeroCartao.replace(/\s/g, '');
  
  if (/^4/.test(num)) return 'visa';
  if (/^5[1-5]/.test(num)) return 'mastercard';
  if (/^3[47]/.test(num)) return 'amex';
  if (/^6(?:011|5)/.test(num)) return 'discover';
  if (/^3(?:0[0-5]|[68])/.test(num)) return 'diners';
  if (/^(?:636368|636369|438935|504175|451416|636297|5067|4576|4011|506699)/.test(num)) return 'elo';
  if (/^(606282|3841)/.test(num)) return 'hipercard';
  
  return '';
}