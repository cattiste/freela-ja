// src/utils/uploadFoto.js
const CLOUD_NAME = 'dbemvuau3'
const UPLOAD_PRESET = 'preset-publico'
const FOLDER = 'freelaja/perfis'

export async function uploadFoto(file) {
  if (!file) throw new Error('Arquivo inválido')
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`
  const fd = new FormData()
  fd.append('file', file)
  fd.append('upload_preset', UPLOAD_PRESET)
  fd.append('folder', FOLDER)

  const res = await fetch(url, { method: 'POST', body: fd })
  let data
  try { data = await res.json() } catch { /* ignore */ }

  if (!res.ok || !data?.secure_url) {
    const reason = data?.error?.message || data?.message || 'Falha no upload'
    throw new Error(reason)
  }
  return data.secure_url
}
