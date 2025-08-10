import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import {
  doc, getDoc, updateDoc, serverTimestamp,
  collection, query, where, getDocs
} from 'firebase/firestore'
import { auth, db } from '@/firebase'

import MenuInferiorPessoaFisica from '@/components/MenuInferiorPessoaFisica'
import BuscarFreelas from '@/components/buscarfreelas' // <- caminho correto (minúsculo)

// usar o componente que você criou para PF (fica em components)
import AgendaEventosPF from '@/components/AgendaEventosPF'

import ServicosPessoaFisica from '@/components/ServicosPessoaFisica'
import AvaliacoesRecebidasPessoaFisica from '@/pages/pf/AvaliacoesRecebidasPessoaFisica'
import HistoricoChamadasPessoaFisica from '@/components/HistoricoChamadasPessoaFisica'
import ChamadasPessoaFisica from '@/pages/pf/ChamadasPessoaFisica'
import { useUsuariosOnline } from '@/hooks/useUsuariosOnline'

// usar o card PF
import CardAvaliacaoFreelaPF from '@/components/CardAvaliacaoFreelaPF'

import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

export default function PainelPessoaFisica() {
  const [pessoaFisica, setPessoaFisica] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const [agendaPerfil, setAgendaPerfil] = useState({})

  const { usuariosOnline } = useUsuariosOnline()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuario) => {
      if (!usuario) {
        setPessoaFisica(null)
        setCarregando(false)
        return
      }

      try {
        const ref = doc(db, 'usuarios', usuario.uid)
        const snap = await getDoc(ref)

        // aceitar 'pessoa_fisica' e 'pessoaFisica'
        if (snap.exists() && (snap.data().tipo === 'pessoa_fisica' || snap.data().tipo === 'pessoaFisica')) {
          const dados = snap.data()
          setPessoaFisica({ uid: usuario.uid, ...dados })
          await updateDoc(ref, { ultimaAtividade: serverTimestamp() })
        } else {
          setPessoaFisica(null)
        }
      } catch (err) {
        console.error('[Auth] Erro ao buscar dados:', err)
      } finally {
        setCarregando(false)
      }
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!pessoaFisica?.uid) return
    carregarAgenda()
    carregarAvaliacoesPendentes()
  }, [pessoaFisica])

  const carregarAgenda = async () => {
    const ref = collection(db, 'usuarios', pessoaFisica.uid, 'agenda')
    const snap = await getDocs(ref)
    const datas = {}
    snap.docs.forEach(docu => {
      datas[docu.id] = docu.data()
    })
    setAgendaPerfil(datas)
  }

  const carregarAvaliacoesPendentes = async () => {
    try {
      const ref = collection(db, 'chamadas')
      const q = query(
        ref,
        where('pessoaFisicaUid', '==', pessoaFisica.uid),
        where('status', '==', 'concluido')
      )

      const snap = await getDocs(q)
      const pendentes = snap.docs
        .map(docu => ({ id: docu.id, ...docu.data() }))
        .filter(chamada => !chamada.avaliacaoFreela?.nota)

      setAvaliacoesPendentes(pendentes)
    } catch (err) {
      console.error('Erro ao buscar chamadas pendentes de avaliação:', err)
    }
  }

  const renderPerfil = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <img
            src={pessoaFisica?.foto || 'https://placehold.co/100x100'}
            alt={pessoaFisica?.nome}
            className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-orange-500 mx-auto"
          />
          <h2 className="text-center text-xl font-bold text-orange-700">{pessoaFisica?.nome}</h2>
          <p className="text-center text-sm text-gray-600 mb-4">
            {pessoaFisica?.profissao} — {pessoaFisica?.especialidade}
          </p>
          <div className="text-sm text-gray-700 space-y-1">
            <p>📞 {pessoaFisica?.celular || 'Telefone não informado'}</p>
            <p>📧 {pessoaFisica?.email}</p>
            <p>📍 {pessoaFisica?.endereco}</p>
            <p>🧾 {pessoaFisica?.cpf}</p>
          </div>

          <button
            onClick={() => (window.location.href = '/pessoa-fisica/editarperfil')}
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
          <p className="text-xs text-gray-500 mt-2">
            Clique em uma data na aba "Agendas" para adicionar ou remover compromissos.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <h3 className="font-bold text-orange-700 mb-2">Freelas a Avaliar</h3>
          {avaliacoesPendentes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum freela para avaliar no momento.</p>
          ) : (
            avaliacoesPendentes.map((chamada) => (
              <CardAvaliacaoFreelaPF
                key={chamada.id}
                chamada={chamada}
                onAvaliado={() => carregarAvaliacoesPendentes()}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )

  const renderConteudo = () => {
    switch (abaSelecionada) {
      case 'perfil':
        return renderPerfil()
      case 'buscar':
        return <BuscarFreelas usuario={pessoaFisica} usuariosOnline={usuariosOnline} />
      case 'agendas':
        return <AgendaEventosPF />
      case 'vagas':
        return <ServicosPessoaFisica pessoaFisica={pessoaFisica} />
      case 'avaliacao':
        return <AvaliacoesRecebidasPessoaFisica />
      case 'historico':
        return <HistoricoChamadasPessoaFisica pessoaFisica={pessoaFisica} />
      case 'ativas':
      case 'chamadas':
        return <ChamadasPessoaFisica pessoaFisica={pessoaFisica} />
      default:
        return null
    }
  }

  if (carregando) return <div className="text-center text-orange-600 mt-8">Carregando painel...</div>
  if (!pessoaFisica) return <div className="text-center text-red-600 mt-8">Acesso não autorizado.</div>

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
      <MenuInferiorPessoaFisica onSelect={setAbaSelecionada} abaAtiva={abaSelecionada} />
    </div>
  )
}
