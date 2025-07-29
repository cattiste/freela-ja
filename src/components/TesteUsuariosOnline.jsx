// 📄 src/components/TesteUsuariosOnline.jsx
import React, { useEffect, useState } from 'react'
import { getDatabase, ref, onValue } from 'firebase/database'

export default function TesteUsuariosOnline() {
  const [usuarios, setUsuarios] = useState({})

  useEffect(() => {
    const db = getDatabase()
    const usersRef = ref(db, 'users')

    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val() || {}
      setUsuarios(data)
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="max-w-2xl mx-auto mt-10 p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold text-orange-600 mb-4">🧪 Teste de Usuários Online</h2>

      {Object.keys(usuarios).length === 0 ? (
        <p className="text-gray-500">Nenhum usuário online.</p>
      ) : (
        <ul className="space-y-2">
          {Object.entries(usuarios).map(([uid, data]) => (
            <li key={uid} className="border-b py-2">
              <p><strong>UID:</strong> {uid}</p>
              <p><strong>Online:</strong> {data.online ? '🟢 Sim' : '🔴 Não'}</p>
              <p><strong>Última atividade:</strong> {data.lastSeen ? new Date(data.lastSeen).toLocaleString() : '—'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
