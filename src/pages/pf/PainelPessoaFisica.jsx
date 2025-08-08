import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/firebase'

import MenuInferiorPF from '@/components/MenuInferiorPF'
import AvaliacoesRecebidasPF from './AvaliacoesRecebidasPF'
import ChamadasPessoaFisica from './ChamadasPessoaFisica'
import AgendaEventosPF from './AgendaEventosPF'
import BuscarFreelas from '@/components/BuscarFreelas'

import { useUsuariosOnline } from '@/hooks/useUsuariosOnline'
import { UserIcon } from '@heroicons/react/24/solid'

export default function PainelPessoaFisica() {
  const [abaAtiva, setAbaAtiva] = useState('inicio')
  const [usuario, setUsuario] = useState(null)
  const [dados, setDados] = useState(null)
  const [carregando, setCarregando] = useState(true)

  const location = useLocation()
  const navigate = useNavigate()

  const usuariosOnline = useUsuariosOnline()

  useEffect(() => {
    if (location?.state?.aba) {
      setAbaAtiva(location.state.aba)
    }
  }, [location])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setUsuario(null)
        setDados(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)

        if (snap.exists() && snap.data().tipo === 'pessoa_fisica') {
          const dados = snap.data()
          setUsuario({ uid: usuario.uid, ...dados })
          setDados(dados)
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        }
      } catch (err) {
        console.error('Erro ao carregar dados da pessoa física:', err)
      }

      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  if (carregando) return <p className="text-center mt-10 text-orange-600">Carregando painel...</p>

  const renderizarConteudo = () => {
    if (abaAtiva === 'inicio') {
      return (
        <div>
          <div className="bg-white rounded-xl p-4 shadow border border-gray-200 mb-4">
            <h2 className="text-lg font-bold text-orange-700 flex items-center gap-2">
              <UserIcon className="h-6 w-6" /> Meus Dados
            </h2>
            <p><strong>Nome:</strong> {dados?.nome}</p>
            <p><strong>Email:</strong> {dados?.email}</p>
            <p><strong>Telefone:</strong> {dados?.telefone || dados?.celular || 'Não informado'}</p>
            <p><strong>Endereço:</strong> {dados?.endereco || 'Não informado'}</p>
            {dados?.foto && <img src={dados.foto} alt="Foto de perfil" className="w-24 h-24 rounded-full mt-2 border border-orange-400 object-cover" />}
          </div>

          <AvaliacoesRecebidasPF />

          <div className="mt-4 text-center">
            <a
              href="/cadastro-evento"
              className="bg-orange-500 text-white px-4 py-2 rounded-full shadow hover:bg-orange-600"
            >
              📆 Publicar Evento
            </a>
          </div>
        </div>
      )
    }

    if (abaAtiva === 'buscar') {
      return (
        <BuscarFreelas usuario={usuario} usuariosOnline={usuariosOnline} />
      )
    }

    if (abaAtiva === 'candidatos') {
      return <ChamadasPessoaFisica usuario={usuario} />
    }

    if (abaAtiva === 'agenda') {
      return <AgendaEventosPF usuario={usuario} />
    }

    return null
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center p-4 pb-20"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="pb-24">{renderizarConteudo()}</div>
      <MenuInferiorPF abaAtiva={abaAtiva} setAbaAtiva={setAbaAtiva} />
    </div>
  )
}
