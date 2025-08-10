// src/utils/uploadFoto.js
const CLOUD_NAME = 'dbemvuau3'
const UPLOAD_PRESET = 'preset-publico'

export async function uploadFoto(file) {
  if (!file) throw new Error('Arquivo inválido')
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)

  const res = await fetch(url, { method: 'POST', body: fd })
  if (!res.ok) {
    const txt = await res.text().catch(() => '')
    throw new Error(`Falha no upload da imagem. ${txt}`)
  }
  const data = await res.json()
  if (!data?.secure_url) throw new Error('Upload sem URL de retorno')
  return data.secure_url
}
