import React, { useState, useEffect } from 'react'
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import '@/styles/estiloAgenda.css'
import { toast } from 'react-hot-toast'

export default function AgendaEventosPF() {
  const { usuario } = useAuth()
  const [eventos, setEventos] = useState([])
  const [dataSelecionada, setDataSelecionada] = useState(new Date())
  const [novoEvento, setNovoEvento] = useState({
    titulo: '',
    descricao: '',
    horario: '',
    endereco: ''
  })
  const [editandoId, setEditandoId] = useState(null)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!usuario?.uid) return

    const carregarEventos = async () => {
      try {
        const q = query(
          collection(db, 'eventosPF'),
          where('pessoaFisicaUid', '==', usuario.uid)
        )
        const querySnapshot = await getDocs(q)
        const eventosData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Converter Firestore Timestamp para Date
          data: doc.data().data.toDate()
        }))
        setEventos(eventosData)
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
        toast.error('Erro ao carregar agenda')
      } finally {
        setCarregando(false)
      }
    }

    carregarEventos()
  }, [usuario])

  const handleDateChange = (date) => {
    setDataSelecionada(date)
    setEditandoId(null)
    setNovoEvento({
      titulo: '',
      descricao: '',
      horario: '',
      endereco: ''
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNovoEvento(prev => ({ ...prev, [name]: value }))
  }

  const salvarEvento = async () => {
    if (!novoEvento.titulo || !novoEvento.horario) {
      toast.error('Preencha pelo menos título e horário')
      return
    }

    try {
      setCarregando(true)
      const eventoData = {
        ...novoEvento,
        data: dataSelecionada,
        pessoaFisicaUid: usuario.uid,
        criadoEm: serverTimestamp()
      }

      if (editandoId) {
        await updateDoc(doc(db, 'eventosPF', editandoId), eventoData)
        toast.success('Evento atualizado com sucesso!')
      } else {
        await addDoc(collection(db, 'eventosPF'), eventoData)
        toast.success('Evento adicionado com sucesso!')
      }

      // Recarregar eventos
      const q = query(
        collection(db, 'eventosPF'),
        where('pessoaFisicaUid', '==', usuario.uid)
      )
      const querySnapshot = await getDocs(q)
      const eventosData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        data: doc.data().data.toDate()
      }))
      setEventos(eventosData)

      // Limpar formulário
      setNovoEvento({
        titulo: '',
        descricao: '',
        horario: '',
        endereco: ''
      })
      setEditandoId(null)
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      toast.error('Erro ao salvar evento')
    } finally {
      setCarregando(false)
    }
  }

  const editarEvento = (evento) => {
    setEditandoId(evento.id)
    setNovoEvento({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      horario: evento.horario,
      endereco: evento.endereco || ''
    })
  }

  const excluirEvento = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este evento?')) {
      try {
        setCarregando(true)
        await deleteDoc(doc(db, 'eventosPF', id))
        setEventos(prev => prev.filter(evento => evento.id !== id))
        toast.success('Evento excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir evento:', error)
        toast.error('Erro ao excluir evento')
      } finally {
        setCarregando(false)
      }
    }
  }

  const eventosDoDia = eventos.filter(evento => {
    return evento.data.toDateString() === dataSelecionada.toDateString()
  })

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-orange-700 mb-6">📅 Minha Agenda de Eventos</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendário */}
          <div className="lg:col-span-1">
            <Calendar
              onChange={handleDateChange}
              value={dataSelecionada}
              className="border rounded-lg p-2"
              tileClassName={({ date }) => {
                const temEvento = eventos.some(
                  evento => evento.data.toDateString() === date.toDateString()
                )
                return temEvento ? 'bg-orange-100' : null
              }}
            />
          </div>

          {/* Formulário e Lista */}
          <div className="lg:col-span-2 space-y-6">
            {/* Formulário */}
            <div className="bg-orange-50 p-4 rounded-lg">
              <h3 className="font-semibold text-orange-700 mb-3">
                {editandoId ? '✏️ Editar Evento' : '➕ Adicionar Evento'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    type="text"
                    name="titulo"
                    value={novoEvento.titulo}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2 text-sm"
                    placeholder="Ex: Festa de Aniversário"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
                  <input
                    type="time"
                    name="horario"
                    value={novoEvento.horario}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2 text-sm"
                    required
                  />
                </div>
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <input
                  type="text"
                  name="endereco"
                  value={novoEvento.endereco}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm"
                  placeholder="Local do evento"
                />
              </div>

              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  name="descricao"
                  value={novoEvento.descricao}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2 text-sm"
                  rows={3}
                  placeholder="Detalhes do evento..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={salvarEvento}
                  disabled={carregando}
                  className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
                >
                  {carregando ? 'Salvando...' : 'Salvar Evento'}
                </button>
                
                {editandoId && (
                  <button
                    onClick={() => {
                      setEditandoId(null)
                      setNovoEvento({
                        titulo: '',
                        descricao: '',
                        horario: '',
                        endereco: ''
                      })
                    }}
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Eventos do Dia */}
            <div>
              <h3 className="font-semibold text-orange-700 mb-3">
                Eventos para {dataSelecionada.toLocaleDateString('pt-BR')}
              </h3>
              
              {carregando ? (
                <p className="text-center text-gray-500">Carregando...</p>
              ) : eventosDoDia.length === 0 ? (
                <p className="text-center text-gray-500">Nenhum evento agendado para este dia</p>
              ) : (
                <div className="space-y-3">
                  {eventosDoDia.map(evento => (
                    <div key={evento.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-orange-700">{evento.titulo}</h4>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Horário:</span> {evento.horario}
                          </p>
                          {evento.endereco && (
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Local:</span> {evento.endereco}
                            </p>
                          )}
                          {evento.descricao && (
                            <p className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Detalhes:</span> {evento.descricao}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => editarEvento(evento)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => excluirEvento(evento.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Excluir"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}