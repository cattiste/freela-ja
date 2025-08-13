// src/pages/pf/PerfilPessoaFisica.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'

const AVATAR_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
  <rect width="100%" height="100%" fill="#f3f4f6"/>
  <circle cx="60" cy="45" r="22" fill="#d1d5db"/>
  <rect x="26" y="80" width="68" height="22" rx="11" fill="#d1d5db"/>
</svg>`)

export default function PerfilPessoaFisica() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const [pessoa, setPessoa] = useState(null)
  const [avaliacoes, setAvaliacoes] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  useEffect(() => {
    async function carregarPessoa() {
      try {
        const pessoaRef = doc(db, 'usuarios', uid)
        const pessoaSnap = await getDoc(pessoaRef)

        if (!pessoaSnap.exists()) {
          setErro('Pessoa física não encontrada.')
          setCarregando(false)
          return
        }

        setPessoa(pessoaSnap.data())

        const q = query(
          collection(db, 'avaliacoesPessoasFisicas'),
          where('pessoaFisicaUid', '==', uid),
          orderBy('dataCriacao', 'desc')
        )
        const snapshot = await getDocs(q)
        const lista = snapshot.docs.map(docu => ({ id: docu.id, ...docu.data() }))
        setAvaliacoes(lista)

        if (lista.length > 0) {
          const soma = lista.reduce((total, av) => total + av.nota, 0)
          const media = soma / lista.length
          setPessoa((prev) => ({ ...prev, mediaAvaliacao: media }))
        }

      } catch (e) {
        console.error(e)
        setErro('Erro ao carregar dados da pessoa física.')
      } finally {
        setCarregando(false)
      }
    }

    carregarPessoa()
  }, [uid])

  const renderEstrelas = (nota) => {
    const estrelasCheias = Math.floor(nota)
    const meiaEstrela = nota % 1 >= 0.5
    const estrelasVazias = 5 - estrelasCheias - (meiaEstrela ? 1 : 0)

    return (
      <div className="flex text-yellow-500 text-lg">
        {'★'.repeat(estrelasCheias)}
        {meiaEstrela && '☆'}
        {'☆'.repeat(estrelasVazias)}
      </div>
    )
  }

  const formatarData = (data) => {
    try {
      return data?.toDate().toLocaleDateString('pt-BR') || '—'
    } catch {
      return '—'
    }
  }

  if (carregando) return <p className="p-6">Carregando perfil...</p>
  if (erro) return <p className="p-6 text-red-500">{erro}</p>

  return (
    <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-lg max-w-md w-full p-6 text-center">
        <img
          src={pessoa?.foto || AVATAR_PLACEHOLDER}
          alt={pessoa?.nome || 'Pessoa'}
          className="w-24 h-24 rounded-full object-cover mx-auto mb-2 border-2 border-yellow-500"
        />
        <h1 className="text-2xl font-bold text-yellow-700 mb-1">{pessoa.nome}</h1>
        <p className="text-gray-600 mb-2">{pessoa.endereco}</p>
        {pessoa.celular && <p className="text-gray-600 mb-2">📞 {pessoa.celular}</p>}

        {pessoa.mediaAvaliacao && (
          <>
            {renderEstrelas(pessoa.mediaAvaliacao)}
            <p className="text-gray-600 text-sm mb-2">
              Avaliação média: {pessoa.mediaAvaliacao.toFixed(1)} / 5
            </p>
          </>
        )}

        {avaliacoes.length > 0 && (
          <div className="mt-6 text-left">
            <h3 className="text-sm font-bold text-yellow-700 mb-2">⭐ Avaliações Recebidas</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {avaliacoes.map((av) => (
                <div key={av.id} className="bg-gray-50 p-2 rounded border border-gray-200">
                  {renderEstrelas(av.nota)}
                  <p className="text-gray-700 text-sm">{av.comentario || 'Sem comentário'}</p>
                  <p className="text-xs text-gray-500 italic mt-1">
                    {av.freelaNome || 'Freela'} — {formatarData(av.dataCriacao)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {usuario && usuario.tipo === 'freela' && usuario.uid !== uid && (
          <button
            onClick={() => navigate(`/avaliacao/pf/${uid}`)}
            className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-full hover:bg-yellow-700 transition"
          >
            Avaliar esta Pessoa
          </button>
        )}

        <button
          onClick={() => navigate(-1)}
          className="mt-6 px-6 py-2 bg-yellow-500 text-white rounded-full hover:bg-yellow-600 transition"
        >
          ← Voltar
        </button>
        
        {usuario?.uid === uid && (
          <button
            onClick={() => navigate('/pf/editarperfil')}
            className="mt-4 w-full text-center bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition"
          >
            ✏️ Editar Perfil
          </button>
        )}
      </div>
    </div>
  )
}
