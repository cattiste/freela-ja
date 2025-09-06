// src/utils/loadEfiSDK.js
export function carregarSDKEfi() {
  return new Promise((resolve, reject) => {
    if (window.$gn) {
      resolve()
      return
    }

    const s = document.createElement('script')
    s.type = 'text/javascript'
    const v = parseInt(Math.random() * 1000000)
    s.src = `https://sandbox.gerencianet.com.br/v1/cdn/ddf01373bd8462f080f08de872edc311/${v}`
    s.async = false
    s.id = 'sdk-efi'

    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Erro ao carregar SDK da Efi'))

    document.head.appendChild(s)
  })
}
