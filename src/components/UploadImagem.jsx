import React, { useState } from 'react';

export default function UploadFoto({ onUploadComplete }) {
  const [foto, setFoto] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'ml_default'); // seu upload preset no Cloudinary
      formData.append('folder', 'perfil/fotos'); // pasta no Cloudinary (asset folder)

      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dbemvuau3/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await res.json();

      if (data.secure_url) {
        setFoto(data.secure_url);
        if (onUploadComplete) onUploadComplete(data.secure_url); // retorna URL pro componente pai
      } else {
        setError('Erro ao enviar a foto.');
      }
    } catch (err) {
      setError('Erro ao enviar a foto: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <label htmlFor="upload">Escolha uma foto:</label>
      <input
        id="upload"
        type="file"
        accept="image/*"
        onChange={handleUploadFoto}
        disabled={uploading}
        style={{ display: 'block', marginBottom: 12 }}
      />

      {uploading && <p>Enviando foto...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {foto && (
        <img
          src={foto}
          alt="Foto enviada"
          style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 60, marginTop: 10 }}
        />
      )}
    </div>
  );
}
