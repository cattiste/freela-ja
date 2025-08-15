// src/components/ProfissionalCardMini.jsx
import React from 'react'
import { toast } from 'react-hot-toast'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase'

export default function ProfissionalCardMini({ freela, usuario }) {
  const chamarFreela = async () => {
    try {
      if (!usuario?.uid || !freela?.uid) {
        toast.error('Erro: dados incompletos.')
        return
      }

      const chamadaId = `${usuario.uid}_${Date.now()}`
      const novaChamada = {
        idPersonalizado: chamadaId,
        freelaUid: freela.uid,
        freelaNome: freela.nome,
        freelaFoto: freela.foto || '',
        valorDiaria: freela.valorDiaria || null,
        status: 'pendente',
        criadoEm: serverTimestamp(),
        ...(usuario.tipo === 'contratante'
          ? {
              contratanteUid: usuario.uid,
              contratanteNome: usuario.nome || '',
            }
          : {
              pessoaFisicaUid: usuario.uid,
              pessoaFisicaNome: usuario.nome || '',
            }),
      }

      await setDoc(doc(db, 'chamadas', chamadaId), novaChamada)
      toast.success(`✅ Chamada enviada para ${freela.nome}`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      toast.error('Erro ao chamar freela.')
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 border border-orange-100 shadow-sm flex flex-col items-center text-center w-full max-w-xs mx-auto">
      <div className="relative">
        <img
          src={freela.foto || '/placeholder-avatar.png'}
          alt={freela.nome}
          className="w-20 h-20 rounded-full object-cover border border-orange-200"
        />
        <span
          className={`absolute top-0 right-0 text-[10px] font-semibold px-2 py-[2px] rounded-full ${
            freela.online ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'
          }`}
        >
          {freela.online ? 'Online' : 'Offline'}
        </span>
      </div>

      <div className="mt-2 space-y-1 text-sm">
        <p className="font-semibold text-orange-700">{freela.nome}</p>
        <p className="text-gray-700">{freela.funcao}</p>
        {freela.especialidades && (
          <p className="text-xs text-gray-500">
            {Array.isArray(freela.especialidades)
              ? freela.especialidades.join(', ')
              : freela.especialidades}
          </p>
        )}
        <p className="text-sm font-bold text-gray-800 mt-2">
          Diária: R$ {freela.valorDiaria?.toFixed(2)}
        </p>
        <p className="text-xs text-gray-600">
          Distância: {freela.distanciaKm != null ? `${freela.distanciaKm.toFixed(1)} km` : '—'}
        </p>
      </div>

      <button
        onClick={chamarFreela}
        className="mt-4 w-full py-1.5 text-sm rounded-md bg-orange-600 hover:bg-orange-700 text-white"
      >
        Chamar
      </button>
    </div>
  )
}
