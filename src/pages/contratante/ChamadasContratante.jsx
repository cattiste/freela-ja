import React, { useEffect, useState } from 'react'
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import toast from 'react-hot-toast'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from '@/firebase'

export default function ChamadasContratante() {
  const { usuario } = useAuth()
  const [chamadas, setChamadas] = useState([])
  const [senha, setSenha] = useState('')
  const [loadingPagamento, setLoadingPagamento] = useState(null)
  const [cartaoSalvo, setCartaoSalvo] = useState(null)
  const [mostrarFormCartao, setMostrarFormCartao] = useState(false)

  const [cartao, setCartao] = useState({
    numero: '',
    vencimento: '',
    cvv: '',
    nome: '',
    cpf: '',
    senha: ''
  })

  const functions = getFunctions(app, 'southamerica-east1')
  const listarCartao = httpsCallable(functions, 'listarCartao')
  const salvarCartao = httpsCallable(functions, 'salvarCartao')
  const confirmarPagamentoComSenha = httpsCallable(functions, 'confirmarPagamentoComSenha')
  const pagarFreela = httpsCallable(functions, 'pagarFreela')

  useEffect(() => {
    if (!usuario?.uid) return

    const q = query(
      collection(db, 'chamadas'),
      where('contratanteUid', '==', usuario.uid),
      where('status', 'in', ['aceita', 'checkin_freela', 'em_andamento', 'checkout_freela'])
    )

    const unsubscribe = onSnapshot(q, (snap) => {
      const lista = []
      snap.forEach((doc) => lista.push({ id: doc.id, ...doc.data() }))
      setChamadas(lista)
    })

    return () => unsubscribe()
  }, [usuario?.uid])

  useEffect(() => {
    const buscarCartao = async () => {
      try {
        const func = httpsCallable(functions, 'listarCartao')
        const res = await func({ uid: usuario.uid })
        if (res?.data) {
          setCartaoSalvo(res.data)
        }
      } catch (err) {
        console.error('Erro ao buscar cartão salvo:', err)
      }
    }

    if (usuario?.uid) buscarCartao()
  }, [usuario?.uid])

  const cadastrarCartao = async () => {
    try {
      const func = httpsCallable(functions, 'salvarCartao')
      const res = await func({
        uid: usuario.uid,
        numeroCartao: cartao.numero,
        bandeira: 'visa', // 💡 pode ajustar isso depois
        senhaPagamento: cartao.senha
      })
      toast.success(res.data?.mensagem || 'Cartão salvo com sucesso!')
      setCartaoSalvo(cartao)
      setMostrarFormCartao(false)
    } catch (err) {
      toast.error('Erro ao salvar cartão: ' + err.message)
    }
  }

  const pagarComCartao = async (chamada) => {
    if (!senha) {
      toast.error('Digite sua senha de pagamento')
      return
    }

    setLoadingPagamento(chamada.id)
    try {
      const validarSenha = httpsCallable(functions, 'confirmarPagamentoComSenha')
      const r1 = await validarSenha({ uid: usuario.uid, senha })

      if (!r1.data?.sucesso) throw new Error(r1.data?.erro)

      const pagarFreela = httpsCallable(functions, 'pagarFreela')
      const r2 = await pagarFreela({ chamadaId: chamada.id })

      if (!r2.data?.sucesso) throw new Error(r2.data?.erro)

      toast.success('Pagamento com cartão realizado com sucesso!')
    } catch (err) {
      toast.error(`Erro: ${err.message}`)
    } finally {
      setLoadingPagamento(null)
    }
  }

 const gerarPix = async (chamada) => {
  try {
    const resposta = await fetch('https://southamerica-east1-freelaja-web-50254.cloudfunctions.net/api/gerarPix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: chamada.valorDiaria,
        nome: usuario.nome,
        cpf: usuario.cpf,
        idChamada: chamada.id,
      })
    });

    const res = await resposta.json();

    if (res.qrCode) {
      toast.success('Pix gerado com sucesso!');
      window.open(res.imagemQrCode, '_blank');
    } else {
      toast.error(res.erro || 'Erro ao gerar Pix.');
    }
  } catch (err) {
    console.error('Erro ao gerar Pix:', err);
    toast.error('Erro ao gerar Pix.');
  }
}


  const confirmarCheckIn = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'checkin_confirmado',
      checkInConfirmadoPeloContratanteHora: serverTimestamp(),
    })
    toast.success('✅ Check-in confirmado')
  }

  const confirmarCheckOut = async (id) => {
    await updateDoc(doc(db, 'chamadas', id), {
      status: 'concluido',
      checkOutConfirmadoPeloContratanteHora: serverTimestamp(),
    })
    toast.success('✅ Check-out confirmado')
  }

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-orange-700 text-center mb-4">📡 Chamadas Ativas</h1>

      <div className="bg-white border border-blue-300 p-3 rounded-lg mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-blue-600">💳 Cartão Cadastrado</span>
          {!mostrarFormCartao && (
            <button onClick={() => setMostrarFormCartao(true)} className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm">
              + Cadastrar Cartão
            </button>
          )}
        </div>

        {cartaoSalvo ? (
          <p className="text-sm">Cartão final {cartaoSalvo.numero?.slice(-4)}</p>
        ) : (
          <p className="text-sm text-gray-500">Nenhum cartão cadastrado ainda.</p>
        )}

        {mostrarFormCartao && (
          <div className="bg-gray-100 p-4 mt-2 rounded-lg space-y-2">
            <input type="text" placeholder="Número do cartão" className="input w-full" value={cartao.numero} onChange={e => setCartao({ ...cartao, numero: e.target.value })} />
            <div className="flex gap-2">
              <input type="text" placeholder="MM/AA" className="input w-1/2" value={cartao.vencimento} onChange={e => setCartao({ ...cartao, vencimento: e.target.value })} />
              <input type="text" placeholder="CVV" className="input w-1/2" value={cartao.cvv} onChange={e => setCartao({ ...cartao, cvv: e.target.value })} />
            </div>
            <input type="text" placeholder="Nome do titular" className="input w-full" value={cartao.nome} onChange={e => setCartao({ ...cartao, nome: e.target.value })} />
            <input type="text" placeholder="CPF" className="input w-full" value={cartao.cpf} onChange={e => setCartao({ ...cartao, cpf: e.target.value })} />
            <input type="password" placeholder="Senha para pagamento" className="input w-full" value={cartao.senha} onChange={e => setCartao({ ...cartao, senha: e.target.value })} />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setMostrarFormCartao(false)} className="bg-gray-300 px-3 py-1 rounded">Cancelar</button>
              <button onClick={cadastrarCartao} className="bg-green-600 text-white px-3 py-1 rounded">Salvar Cartão</button>
            </div>
          </div>
        )}
      </div>

      {chamadas.length === 0 ? (
        <p className="text-center text-gray-600">Nenhuma chamada ativa no momento.</p>
      ) : (
        chamadas.map((chamada) => (
          <div key={chamada.id} className="bg-white shadow-md rounded-xl p-4 mb-4 space-y-2 border border-orange-300">
            <h2 className="text-lg font-semibold text-orange-600">Chamada #{chamada.id.slice(-5)}</h2>
            <p><strong>Freela:</strong> {chamada.freelaNome || chamada.freelaUid}</p>
            <p><strong>Status:</strong> {chamada.status}</p>
            <p><strong>Valor da diária:</strong> R$ {chamada.valorDiaria?.toFixed(2) || '---'}</p>
            {chamada.observacao && <p><strong>📄 Observação:</strong> {chamada.observacao}</p>}

            <div className="flex flex-col sm:flex-row gap-2">
              {chamada.status === 'aceita' && (
                <>
                  <input
                    type="password"
                    placeholder="Senha de pagamento"
                    className="input w-full sm:w-auto"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                  />
                  <button
                    onClick={() => pagarComCartao(chamada)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    disabled={loadingPagamento === chamada.id}
                  >
                    {loadingPagamento === chamada.id ? 'Pagando...' : 'Pagar com Cartão'}
                  </button>
                  <button
                    onClick={() => pagarComPix(chamada)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                  >
                    Pagar com Pix
                  </button>
                </>
              )}
              {chamada.status === 'checkin_freela' && (
                <button
                  onClick={() => confirmarCheckIn(chamada.id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Confirmar Check-in
                </button>
              )}
              {chamada.status === 'checkout_freela' && (
                <button
                  onClick={() => confirmarCheckOut(chamada.id)}
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                >
                  Confirmar Check-out
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
