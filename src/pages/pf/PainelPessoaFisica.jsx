import React, { useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '@/firebase'

import MenuInferiorPF from '@/components/MenuInferiorPF'
import BuscarFreelasPF from '@/pages/pf/BuscarFreelasPF'
import ChamadasPessoaFisica from '@/pages/pf/ChamadasPessoaFisica'

// hooks/agenda/avaliacoes — se você já tiver as versões PF, troque os imports
import CardAvaliacaoFreela from '@/components/CardAvaliacaoFreela'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'

// Hook PF de online
import useOnlineFreelasPF from '@/hooks/pf/useOnlineFreelasPF'

export default function PainelPessoaFisica() {
  const [pessoa, setPessoa] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [abaSelecionada, setAbaSelecionada] = useState('perfil')
  const [avaliacoesPendentes, setAvaliacoesPendentes] = useState([])
  const [agendaPerfil, setAgendaPerfil] = useState({})

  const usuariosOnlinePF = useOnlineFreelasPF()

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
        } else {
          setPessoa(null)
        }
      } catch (err) {
        console.error('[Auth] Erro ao buscar dados da PF:', err)
      } finally {
        setCarregando(false)
      }
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!pessoa?.uid) return
    carregarAgenda()
    carregarAvaliacoesPendentes()
  }, [pessoa])

  const carregarAgenda = async () => {
    const ref = collection(db, 'usuarios', pessoa.uid, 'agenda')
    const snap = await getDocs(ref)
    const datas = {}
    snap.docs.forEach(doc => { datas[doc.id] = doc.data() })
    setAgendaPerfil(datas)
  }

  // PF avaliando freelas: busca chamadas concluidas que ela abriu e não avaliou ainda
  const carregarAvaliacoesPendentes = async () => {
    try {
      const ref = collection(db, 'chamadas')
      const q = query(ref, where('pessoaFisicaUid', '==', pessoa.uid), where('status', '==', 'concluido'))
      const snap = await getDocs(q)
      const pendentes = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(chamada => !chamada.avaliacaoFreela?.nota)
      setAvaliacoesPendentes(pendentes)
    } catch (err) {
      console.error('Erro ao buscar pendências:', err)
    }
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
          <p className="text-center text-sm text-gray-600 mb-4">Usuário Pessoa Física</p>
          <div className="text-sm text-gray-700 space-y-1">
            <p>📞 {pessoa?.celular || pessoa?.telefone || 'Telefone não informado'}</p>
            <p>📧 {pessoa?.email}</p>
            <p>📍 {pessoa?.endereco || 'Endereço não informado'}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <h3 className="text-lg font-bold text-orange-700 mb-2">Minha Agenda</h3>
          <Calendar
            tileContent={({ date }) => {
              const dia = date.toISOString().split('T')[0]
              if (agendaPerfil[dia]) {
                return <div className="text-xs text-orange-700 font-bold mt-1">📌 {agendaPerfil[dia].nota || 'Ocupado'}</div>
              }
              return null
            }}
          />
          <p className="text-xs text-gray-500 mt-2">Acesse a aba "Agenda" para gerenciar eventos.</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-orange-300">
          <h3 className="font-bold text-orange-700 mb-2">Freelas a Avaliar</h3>
          {avaliacoesPendentes.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum freela para avaliar no momento.</p>
          ) : (
            avaliacoesPendentes.map((chamada) => (
              <CardAvaliacaoFreela key={chamada.id} chamada={chamada} onAvaliado={() => carregarAvaliacoesPendentes()} />
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
        // 💡 converte o hook PF {uid:{online,perfil}} no mapa {uid:{online}}
        const usuariosOnline = Object.fromEntries(
          Object.entries(usuariosOnlinePF).map(([uid, v]) => [uid, { online: !!v.online }])
        )
        return <BuscarFreelasPF usuario={pessoa} usuariosOnline={usuariosOnline} />
      case 'agenda':
        return <div className="p-4 pb-24 text-gray-600">Agenda da PF (implemente aqui sua AgendaEventosPF)</div>
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
      className="min-h-screen bg-cover bg-center p-4 pb-24"
      style={{
        backgroundImage: `url('/img/fundo-login.jpg')`,
        // sem backgroundAttachment: 'fixed' aqui p/ não cobrir a barra
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      {renderConteudo()}
      <MenuInferiorPF />
    </div>
  )
}
