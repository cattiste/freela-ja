// src/pages/pf/PainelPessoaFisica.jsx
import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, updateDoc, serverTimestamp,
  collection, query, where, getDocs
} from 'firebase/firestore'
import { auth, db } from '@/firebase'

import MenuInferiorPF from '@/components/MenuInferiorPF'
import BuscarFreelas from '@/components/BuscarFreelas'
import AgendaEventosPF from '@/pages/pf/AgendaEventosPF'
import AvaliacoesRecebidasPF from '@/pages/pf/AvaliacoesRecebidasPF'
import ChamadasPessoaFisica from '@/pages/pf/ChamadasPessoaFisica'
import { useUsuariosOnline } from '@/hooks/useUsuariosOnline'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

export default function PainelPessoaFisica() {
  const [pessoa, setPessoa] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [agendaPerfil, setAgendaPerfil] = useState({})

  const usuariosOnline = useUsuariosOnline()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setPessoa(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)

        if (snap.exists() && snap.data().tipo === 'pessoa_fisica') {
          const dados = snap.data()
          setPessoa({ uid: usuario.uid, ...dados })
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        }
      } catch (err) {
        console.error('[Auth] Erro ao buscar dados da pessoa física:', err)
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!pessoa?.uid) return
    carregarAgenda()
  }, [pessoa])

  const carregarAgenda = async () => {
    const ref = collection(db, 'usuarios', pessoa.uid, 'agenda')
    const snap = await getDocs(ref)
    const datas = {}
    snap.docs.forEach(doc => {
      datas[doc.id] = doc.data()
    })
    setAgendaPerfil(datas)
  }

  const renderPerfil = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <img
            src={pessoa?.foto || 'https://placehold.co/100x100'}
            alt={pessoa?.nome}
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-orange-500 mx-auto"
          />
          <h2 className="text-center text-xl font-bold text-orange-700">{pessoa?.nome}</h2>
          <p className="text-center text-sm text-gray-600 mb-4">
            {pessoa?.funcao} — {pessoa?.especialidade}
          </p>
          <div className="text-sm text-gray-700 space-y-1">
            <p>📞 {pessoa?.celular || 'Telefone não informado'}</p>
            <p>📧 {pessoa?.email}</p>
            <p>📍 {pessoa?.endereco}</p>
            <p>🆔 CPF: {pessoa?.cpf}</p>
          </div>
          <button
            onClick={() => window.location.href = '/pessoa_fisica/editarperfil'}
            className="mt-4 w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
          >
            ✏️ Editar Perfil
          </button>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <h3 className="text-lg font-bold text-orange-700 mb-2">Minha Agenda</h3>
          <Calendar
            tileContent={({ date }) => {
              const dia = date.toISOString().split('T')[0]
              if (agendaPerfil[dia]) {
                return (
                  <div className="text-xs text-orange-700 font-bold mt-1">
                    📌 {agendaPerfil[dia].nota || 'Ocupado'}
                  </div>
                )
              }
              return null
            }}
          />
          <p className="text-xs text-gray-500 mt-2">Clique em uma data na aba "Agenda" para adicionar ou remover compromissos.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <h3 className="font-bold text-orange-700 mb-2">Avaliações Recebidas</h3>
          <AvaliacoesRecebidasPF />
        </div>
      </div>
    </div>
  )

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return renderPerfil()
      case 'buscar':
        return <BuscarFreelas estabelecimento={pessoa} usuariosOnline={usuariosOnline} />
      case 'agendas':
        return <AgendaEventosPF pessoa={pessoa} />
      case 'chamadas':
        return <ChamadasPessoaFisica usuario={pessoa} />
      default:
        return null
    }
  }

  if (carregando) return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  if (!pessoa) return <div className="text-center text-red-600 mt-8">Acesso não autorizado.</div>

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
      {renderConteudo()}
      <MenuInferiorPF onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
