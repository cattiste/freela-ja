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
      formData.append('folder', 'perfil/fotos'); // pasta no Cloudinary

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
        if (onUploadComplete) onUploadComplete(data.secure_url);
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
    <div className="max-w-sm mx-auto p-5">
      <label htmlFor="upload" className="block mb-2 font-semibold text-gray-700 cursor-pointer">
        Escolha uma foto:
      </label>
      <input
        id="upload"
        type="file"
        accept="image/*"
        onChange={handleUploadFoto}
        disabled={uploading}
        className="block w-full mb-4 cursor-pointer text-sm text-gray-500
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-md file:border-0
                   file:text-sm file:font-semibold
                   file:bg-indigo-50 file:text-indigo-700
                   hover:file:bg-indigo-100
                   disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {uploading && <p className="text-blue-600">Enviando foto...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {foto && (
        <img
          src={foto}
          alt="Foto enviada"
          className="w-32 h-32 object-cover rounded-full mt-4 mx-auto shadow-md"
        />
      )}
    </div>
  );
}
