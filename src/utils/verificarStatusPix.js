// src/utils/verificarStatusPix.js
import axios from 'axios'

export async function verificarStatusPix(txid) {
  try {
    const response = await axios.post(
      'https://southamerica-east1-freelaja-web-50254.cloudfunctions.net/verificarStatusPix',
      { txid }
    )
    return response.data // { status: 'CONCLUIDA' } ou { status: 'ATIVA' }
  } catch (err) {
    console.error('[verificarStatusPix] erro:', err.response?.data || err.message)
    return null
  }
}
