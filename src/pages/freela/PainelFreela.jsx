import React from 'react'
import AgendaFreela from '@/pages/freela/AgendaFreela'
import AvaliacoesRecebidasFreela from '@/pages/freela/AvaliacoesRecebidasFreela'

export default function PerfilFreela({ freela }) {
  if (!freela) {
    return <div className="text-center text-gray-500">Carregando perfil...</div>
  }

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      setFreela(null)
      setCarregando(false)
      return
    }

    try {
      const ref = doc(db, 'usuarios', user.uid)
      const snap = await getDoc(ref)

      if (snap.exists() && snap.data().tipo === 'freela') {
        const dados = snap.data()
        setFreela({ uid: user.uid, ...dados })
        await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
      } else {
        console.warn('[Auth] Documento não encontrado ou não é um freela')
      }
    } catch (err) {
      console.error('[Auth] Erro ao buscar dados do freela:', err)
    } finally {
      setCarregando(false)
    }
  })

  return () => unsubscribe()
}, [])


  return (
    <>
      <div className="bg-white rounded-xl shadow p-4 text-center">
        <img
          src={freela.foto || 'https://via.placeholder.com/100'}
          alt="Foto do Freela"
          className="w-24 h-24 rounded-full mx-auto border-2 border-orange-300 object-cover"
        />
        <h2 className="text-xl font-bold text-orange-700 mt-2">{freela.nome}</h2>
        <p className="text-sm text-gray-600">{freela.especialidade}</p>
        <p className="text-sm text-gray-600">📞 {freela.celular}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-4">
        <AgendaFreela freela={freela} />
        <AvaliacoesRecebidasFreela freelaUid={freela.uid} />
      </div>
    </>
  )
}
