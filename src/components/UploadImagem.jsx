import React, { useState } from 'react'

export default function UploadImagem({ onUpload }) {
  const [preview, setPreview] = useState(null)
  const [tamanho, setTamanho] = useState(null)

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 1024 * 1024) {
      alert('Imagem muito grande. Envie uma com até 1MB.')
      return
    }

    setPreview(URL.createObjectURL(file))
    setTamanho((file.size / 1024).toFixed(2)) // em KB

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ml_default') // use o preset padrão gratuito
    formData.append('cloud_name', 'dbemvuau3')

    const res = await fetch('https://api.cloudinary.com/v1_1/dbemvuau3/image/upload', {
      method: 'POST',
      body: formData
    })

    const data = await res.json()
    onUpload(data.secure_url) // retorna a URL final
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-bold mb-1">Foto de Perfil</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="w-full p-2 border rounded"
      />

      {preview && (
        <div className="mt-2">
          <p className="text-sm text-gray-500">Tamanho estimado: {tamanho} KB</p>
          <img src={preview} alt="preview" className="mt-2 w-32 h-32 object-cover rounded-full border" />
        </div>
      )}
    </div>
  )
}
