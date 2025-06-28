import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase'

export default function PainelEstabelecimento() {
  const [estabelecimento, setEstabelecimento] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [chamadas, setChamadas] = useState([])

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, 'usuarios', user.uid)
          const snap = await getDoc(docRef)
          if (snap.exists() && snap.data().tipo === 'estabelecimento') {
            setEstabelecimento({ uid: user.uid, ...snap.data() })
          } else {
            alert('Usuário não é um estabelecimento válido.')
            setEstabelecimento(null)
          }
        } catch (err) {
          console.error('Erro ao buscar estabelecimento:', err)
        }
      } else {
        setEstabelecimento(null)
      }
      setCarregando(false)
    })

    return () => unsubscribeAuth()
  }, [])

  // Carregar chamadas relacionadas ao estabelecimento em tempo real
  useEffect(() => {
    if (!estabelecimento) return

    const chamadasRef = collection(db, 'chamadas')
    const q = query(chamadasRef, where('estabelecimentoUid', '==', estabelecimento.uid))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const listaChamadas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setChamadas(listaChamadas)
    })

    return () => unsubscribe()
  }, [estabelecimento])

  // Confirmar check-in do freela (marcar checkInConfirmadoHora e confirmar)
  const confirmarCheckIn = async (chamada) => {
    try {
      const chamadaRef = doc(db, 'chamadas', chamada.id)

      if (!chamada.checkInFreela) {
        alert('O freela ainda não realizou o check-in.')
        return
      }
      if (chamada.checkInConfirmadoHora) {
        alert('Check-in já confirmado.')
        return
      }

      await updateDoc(chamadaRef, {
        checkInConfirmadoHora: new Date(),
        checkInConfirmado: true
      })
      alert('Check-in confirmado com sucesso!')
    } catch (err) {
      console.error('Erro ao confirmar check-in:', err)
      alert('Erro ao confirmar check-in.')
    }
  }

  // Confirmar check-out do freela (marcar checkOutConfirmadoHora e confirmar)
  const confirmarCheckOut = async (chamada) => {
    try {
      const chamadaRef = doc(db, 'chamadas', chamada.id)

      if (!chamada.checkOutFreela) {
        alert('O freela ainda não realizou o check-out.')
        return
      }
      if (chamada.checkOutConfirmado) {
        alert('Check-out já confirmado.')
        return
      }

      await updateDoc(chamadaRef, {
        checkOutConfirmadoHora: new Date(),
        checkOutConfirmado: true
      })
      alert('Check-out confirmado com sucesso!')
    } catch (err) {
      console.error('Erro ao confirmar check-out:', err)
      alert('Erro ao confirmar check-out.')
    }
  }

  // Logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      setEstabelecimento(null)
      alert('Logout realizado com sucesso.')
      // Opcional: redirecionar para login
      // navigate('/login')
    } catch (err) {
      console.error('Erro ao sair:', err)
      alert('Erro ao sair.')
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-orange-600 text-lg">Carregando painel...</p>
      </div>
    )
  }

  if (!estabelecimento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-lg">Acesso não autorizado.</p>
      </div>
    )
  }

  // Formatar timestamp para string
  const formatTimestamp = (timestamp) => {
    try {
      if (!timestamp) return '—'
      if (timestamp.toDate) return timestamp.toDate().toLocaleString()
      if (timestamp instanceof Date) return timestamp.toLocaleString()
      return new Date(timestamp).toLocaleString()
    } catch {
      return '—'
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-orange-700">📊 Painel do Estabelecimento</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            🔒 Logout
          </button>
        </div>

        <h2 className="text-xl font-semibold mb-4">Chamadas Ativas</h2>

        {chamadas.length === 0 ? (
          <p>Nenhuma chamada encontrada.</p>
        ) : (
          chamadas.map((chamada) => (
            <div key={chamada.id} className="border rounded p-4 mb-4 shadow-sm bg-orange-100">
              <p><strong>Freela:</strong> {chamada.freelaNome}</p>
              <p><strong>Status:</strong> {chamada.status}</p>
              <p><strong>Check-in Freela:</strong> {chamada.checkInFreela ? '✔️ Sim' : '❌ Não'}</p>
              <p><strong>Check-in Confirmado:</strong> {chamada.checkInConfirmado ? '✔️ Sim' : '❌ Não'}</p>
              <p><strong>Hora Check-in Confirmado:</strong> {formatTimestamp(chamada.checkInConfirmadoHora)}</p>

              <button
                disabled={chamada.checkInConfirmado || !chamada.checkInFreela}
                onClick={() => confirmarCheckIn(chamada)}
                className={`mt-2 mr-2 px-4 py-2 rounded-lg ${
                  chamada.checkInConfirmado || !chamada.checkInFreela
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Confirmar Check-in
              </button>

              <p><strong>Check-out Freela:</strong> {chamada.checkOutFreela ? '✔️ Sim' : '❌ Não'}</p>
              <p><strong>Check-out Confirmado:</strong> {chamada.checkOutConfirmado ? '✔️ Sim' : '❌ Não'}</p>
              <p><strong>Hora Check-out Confirmado:</strong> {formatTimestamp(chamada.checkOutConfirmadoHora)}</p>

              <button
                disabled={chamada.checkOutConfirmado || !chamada.checkOutFreela}
                onClick={() => confirmarCheckOut(chamada)}
                className={`mt-2 px-4 py-2 rounded-lg ${
                  chamada.checkOutConfirmado || !chamada.checkOutFreela
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                Confirmar Check-out
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
