import React, { useEffect, useState } from 'react'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import {
  Mail, Phone, Briefcase, UserCircle2,
  MapPin, Home, BadgeDollarSign, ScrollText, Fingerprint
} from 'lucide-react'

export default function PerfilFreela({ freelaId, onEditar }) {
  const [freela, setFreela] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!freelaId) return
    const fetchFreela = async () => {
      try {
        const docRef = doc(db, 'usuarios', freelaId)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          setFreela(snap.data())
        }
      } catch (err) {
        console.error('Erro ao carregar dados do freela:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFreela()
  }, [freelaId])

  if (loading) return <p className="text-center text-gray-600 mt-4">Carregando perfil...</p>
  if (!freela) return <p className="text-center text-red-600 mt-4">Freelancer não encontrado.</p>

  return (
    <div className="bg-white rounded-2xl shadow p-6 max-w-md mx-auto border border-orange-100">
      <div className="flex flex-col items-center mb-4">
        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-orange-400 shadow">
          {freela.foto ? (
            <img src={freela.foto} alt="Foto" className="w-full h-full object-cover" />
          ) : (
            <UserCircle2 className="w-full h-full text-gray-300" />
          )}
        </div>
        <h2 className="text-xl font-bold text-orange-700 mt-4 text-center">{freela.nome || 'Sem nome'}</h2>
      </div>

      <div className="text-sm text-gray-700 space-y-2">
        <InfoItem icon={<Briefcase size={16} />} label={freela.funcao} />
        <InfoItem icon={<ScrollText size={16} />} label={freela.especialidades || 'Especialidades não informadas'} />
        <InfoItem icon={<Phone size={16} />} label={freela.celular} />
        <InfoItem icon={<Mail size={16} />} label={freela.email} />
        <InfoItem icon={<Home size={16} />} label={freela.endereco} />
        <InfoItem icon={<Fingerprint size={16} />} label={freela.cpf || 'CPF não informado'} />
        <InfoItem icon={<BadgeDollarSign size={16} />} label={freela.valorDiaria ? `R$ ${freela.valorDiaria},00 / diária` : 'Valor da diária não informado'} />
      </div>

      {onEditar && (
        <button
          onClick={onEditar}
          className="mt-6 w-full bg-orange-500 text-white font-semibold py-2 rounded-full hover:bg-orange-600 transition"
        >
          ✏️ Editar Perfil
        </button>
      )}
    </div>
  )
}

const InfoItem = ({ icon, label }) => (
  <div className="flex items-center gap-2">
    {icon}
    <span>{label || '—'}</span>
  </div>
)