import React, { useEffect, useState, useMemo } from 'react'
import {
  collection, query, where, onSnapshot, addDoc, serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'

// --- util: distância geodésica (km)
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const toRad = (x) => (x * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// --- card do freela
function FreelaCard({
  freela,
  distanciaKm,
  onChamar,
  chamando,
  observacao,
  setObservacao,
  isOnline
}) {
  const freelaId = freela.uid || freela.id

  return (
    <div className="p-4 bg-white rounded-2xl shadow-lg border border-orange-100 hover:shadow-xl transition">
      <div className="flex flex-col items-center mb-3">
        <img
          src={freela.foto || 'https://via.placeholder.com/80'}
          alt={freela.nome}
          className="w-20 h-20 rounded-full object-cover border-2 border-orange-400"
        />
        <h3 className="mt-2 text-lg font-bold text-orange-700 text-center">{freela.nome}</h3>
        <p className="text-sm text-gray-600 text-center">{freela.funcao}</p>

        {freela.especialidades && (
          <p className="text-sm text-gray-500 text-center">
            {Array.isArray(freela.especialidades)
              ? freela.especialidades.join(', ')
              : freela.especialidades}
          </p>
        )}

        {freela.valorDiaria && (
          <p className="text-sm font-semibold text-orange-700 mt-1">
            💰 R$ {freela.valorDiaria} / diária
          </p>
        )}

        {distanciaKm != null && (
          <p className="text-sm text-gray-600 mt-1">
            📍 Aprox. {distanciaKm.toFixed(1)} km do local
          </p>
        )}

        {/* mostra status online só se estiver realmente online */}
        {isOnline && (
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-700">🟢 Online agora</span>
          </div>
        )}
      </div>

      <div className="mb-2 w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          📝 Observações para o freela
        </label>
        <textarea
          value={observacao[freelaId] || ''}
          onChange={(e) =>
            setObservacao((prev) => ({ ...prev, [freelaId]: e.target.value }))
          }
          placeholder="Ex: Use roupa preta, falar com gerente João..."
          className="w-full p-2 border rounded text-sm"
          rows={2}
          maxLength={200}
        />
        <p className="text-xs text-gray-500 mt-1">⚠️ Não inclua telefone, e-mail ou redes sociais.</p>
      </div>

      <button
        onClick={() => onChamar(freela)}
        disabled={chamando === freelaId}
        className="w-full py-2 px-4 rounded-lg font-semibold transition bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
      >
        {chamando === freelaId ? 'Chamando...' : '📞 Chamar'}
      </button>
    </div>
  )
}

// --- lista/busca
export default function BuscarFreelas({ usuario, usuariosOnline = {} }) {
  const [freelas, setFreelas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [chamando, setChamando] = useState(null)
  const [filtroFuncao, setFiltroFuncao] = useState('')
  const [observacao, setObservacao] = useState({})

  // carrega freelas
  useEffect(() => {
    const q = query(collection(db, 'usuarios'), where('tipo', '==', 'freela'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todos = snapshot.docs.map(doc => {
        const data = doc.data()
        return { ...data, id: doc.id } // doc.id geralmente == uid
      })
      setFreelas(todos)
      setCarregando(false)
    })
    return () => unsubscribe()
  }, [])

  // chamar freela
  const chamarFreela = async (freela) => {
    if (!usuario?.uid) return
    const freelaId = freela.uid || freela.id
    setChamando(freelaId)

    const obs = (observacao[freelaId] || '').trim()

    // bloqueio de contato direto no texto
    const contemContato = /(\d{4,}|\b(zap|whats|telefone|email|contato|instagram|arroba)\b)/i
    if (contemContato.test(obs)) {
      alert('🚫 Não inclua telefone, e-mail ou redes sociais nas instruções.')
      setChamando(null)
      return
    }

    try {
      await addDoc(collection(db, 'chamadas'), {
        freelaUid: freelaId,
        freelaNome: freela.nome,
        freelaFoto: freela.foto || '',
        freelaFuncao: freela.funcao || '',
        freela: {
          uid: freelaId,
          nome: freela.nome,
          foto: freela.foto || '',
          funcao: freela.funcao || ''
        },
        // chamador pode ser estabelecimento OU pessoa_fisica (suas regras permitem ambos)
        chamadorUid: usuario.uid,
        chamadorNome: usuario.nome,
        tipoChamador: usuario.tipo,
        // conveniência para seus cards
        pessoaFisicaUid: usuario.tipo === 'pessoa_fisica' ? usuario.uid : null,
        estabelecimentoUid: usuario.tipo === 'estabelecimento' ? usuario.uid : null,

        valorDiaria: freela.valorDiaria || null,
        observacao: obs,
        status: 'pendente',
        criadoEm: serverTimestamp()
      })
      
      alert(`Freelancer ${freela.nome} foi chamado com sucesso.`)
    } catch (err) {
      console.error('Erro ao chamar freela:', err)
      alert('Erro ao chamar freelancer.')
    } finally {
      setChamando(null)
    }
  }

  // filtra + ordena
  const freelasFiltrados = useMemo(() => {
    return freelas
      .filter((f) => {
        const uid = f.uid || f.id
        const status = usuariosOnline[uid]
        // compat: aceita { online: true } ou { state: 'online' }
        const online = status?.online === true || status?.state === 'online'

        const funcaoMatch =
          !filtroFuncao || f.funcao?.toLowerCase().includes(filtroFuncao.toLowerCase())

        return online && funcaoMatch
      })
      .map((f) => {
        const distanciaKm =
          f.coordenadas && usuario?.coordenadas
            ? calcularDistancia(
                usuario.coordenadas.latitude,
                usuario.coordenadas.longitude,
                f.coordenadas.latitude,
                f.coordenadas.longitude
              )
            : null

        return { ...f, distanciaKm }
      })
      .sort((a, b) => (a.distanciaKm || Infinity) - (b.distanciaKm || Infinity))
  }, [freelas, usuariosOnline, filtroFuncao, usuario])

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
      <div className="max-w-6xl mx-auto mb-6">
        <input
          type="text"
          placeholder="Buscar por função..."
          value={filtroFuncao}
          onChange={(e) => setFiltroFuncao(e.target.value)}
          className="w-full px-4 py-2 rounded-lg shadow-sm border border-gray-300 focus:ring-2 focus:ring-orange-400"
        />
      </div>

      {carregando ? (
        <p className="text-center text-white">Carregando freelancers...</p>
      ) : freelasFiltrados.length === 0 ? (
        <p className="text-center text-white">Nenhum freelancer online com essa função.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {freelasFiltrados.map((freela) => {
            const uid = freela.uid || freela.id
            const status = usuariosOnline[uid]
            const isOnline = status?.online === true || status?.state === 'online'

            return (
              <FreelaCard
                key={uid}
                freela={freela}
                distanciaKm={freela.distanciaKm}
                onChamar={chamarFreela}
                chamando={chamando}
                observacao={observacao}
                setObservacao={setObservacao}
                isOnline={isOnline}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
