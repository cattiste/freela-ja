export function loadEfipayScript(credencialId = 'ddf01373bd8462f080f08de872edc311') {
  return new Promise((resolve, reject) => {
    if (window.$gn && typeof window.$gn.ready === 'function') {
      return resolve(); // já carregado
    }

    const existing = document.getElementById('efi-sdk')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      return
    }

    const script = document.createElement('script')
    script.id = 'efi-sdk'
    script.src = `https://cdn.efipay.com.br/v1/cdn/${credencialId}`
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Erro ao carregar o SDK da Efi.'))
    document.body.appendChild(script)
  })
}
