// src/utils/loadEfipayScript.js

export function loadEfipayScript(credencialId = 'ddf01373bd8462f080f08de872edc311') {
  return new Promise((resolve, reject) => {
    if (typeof window.$gn !== 'undefined') {
      return resolve(window.$gn)
    }

    const existing = document.getElementById('efi-sdk')
    if (existing) {
      existing.onload = () => resolve(window.$gn)
      return
    }

    const script = document.createElement('script')
    script.id = 'efi-sdk'
    script.src = `https://cobrancas.api.efipay.com.br/v1/cdn/${credencialId}/${Math.floor(Math.random() * 100000)}`
    script.async = false
    script.onload = () => resolve(window.$gn)
    script.onerror = () => reject(new Error('Erro ao carregar o SDK da Efipay.'))
    document.head.appendChild(script)
  })
}
