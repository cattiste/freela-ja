import React, { useEffect, useState } from 'react'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/firebase'
import ProfissionalCard from './ProfissionalCard' // seu card do freela

export default function PainelEstabelecimento() {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [user, setUser] = useState(null)
  const [chamandoId, setChamandoId] = useState(null)

  useEffect(() => {
    // Ouça autenticação
    const unsub = auth.onAuthStateChanged(u => setUser(u))
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!user) return

    const buscarFreelas = async () => {
      setCarregando(true)
      try {
        const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setFreelas(lista)
      } catch (err) {
        console.error('Erro ao buscar freelas:', err)
      } finally {
        setCarregando(false)
      }
    }

    buscarFreelas()
  }, [user])

  // Função para chamar freela: cria chamada no Firestore
  const handleChamar = async (prof) => {
    if (!user) {
      alert('Usuário não autenticado')
      return
    }

    setChamandoId(prof.id)

    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: prof.id,
        freelaNome: prof.nome,
        estabelecimentoUid: user.uid,
        estabelecimentoNome: user.displayName || 'Estabelecimento',
        vagaTitulo: 'Vaga Genérica', // Ou campo dinâmico, se tiver vaga selecionada
        status: 'pendente',
        criadoEm: serverTimestamp()
      })
      alert(`Chamada enviada para ${prof.nome}`)
    } catch (err) {
      console.error('Erro ao criar chamada:', err)
      alert('Erro ao chamar o profissional')
    } finally {
      setChamandoId(null)
    }
  }

  if (!user) {
    return <p className="text-center mt-10 text-red-600 font-semibold">Você precisa estar logado para acessar este painel.</p>
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-orange-600 text-center">Painel Estabelecimento</h1>

      {carregando ? (
        <p className="text-center text-gray-600">Carregando freelancers...</p>
      ) : freelas.length === 0 ? (
        <p className="text-center text-gray-500">Nenhum freelancer disponível.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {freelas.map(prof => (
            <ProfissionalCard
              key={prof.id}
              prof={prof}
              onChamar={() => handleChamar(prof)}
              distanciaKm={prof.distanciaKm} // se calcular, se não pode omitir
            >
              {/* Pode passar children se quiser */}
            </ProfissionalCard>
          ))}
        </div>
      )}

      {chamandoId && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg text-center">
            <p>Enviando chamada...</p>
          </div>
        </div>
      )}
    </div>
  )
}
