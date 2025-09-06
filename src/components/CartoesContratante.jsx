import { useState, useEffect } from 'react'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { getPaymentTokenEfipay } from '@/utils/efipay'

export default function CartoesContratante() {
  const { usuario } = useAuth()
  const [abrirCadastroCartao, setAbrirCadastroCartao] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    numero: '',
    validade: '',
    cvv: '',
    bandeira: ''
  })
  const [cartaoSalvo, setCartaoSalvo] = useState(null)

  // Funções de formatação
  const formatCardNumber = (value) => {
    return value.replace(/\D/g, '')
      .replace(/(\d{4})/g, '$1 ')
      .trim()
      .slice(0, 19);
  }

  const formatExpiry = (value) => {
    return value.replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1/$2')
      .slice(0, 5);
  }

  const formatCVV = (value) => {
    return value.replace(/\D/g, '').slice(0, 4);
  }

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Aplica formatação conforme o campo
    if (e.target.name === 'numero') {
      value = formatCardNumber(value);
    } else if (e.target.name === 'validade') {
      value = formatExpiry(value);
    } else if (e.target.name === 'cvv') {
      value = formatCVV(value);
    }
    
    setForm({ ...form, [e.target.name]: value });
  }

  async function gerarTokenCartao() {
    console.log('Cliquei no botão')
    
    const [mes, ano] = form.validade.split('/')
    if (!mes || !ano || !form.numero || !form.cvv || !form.bandeira || !form.nome) {
      toast.error('Preencha todos os campos corretamente.')
      return
    }

    setCarregando(true)

    try {
      const cardData = {
        brand: form.bandeira,
        number: form.numero.replace(/\s/g, ''), // Remove espaços
        cvv: form.cvv,
        expiration_month: mes,
        expiration_year: '20' + ano,
        holder: form.nome
      }

      const token = await getPaymentTokenEfipay(cardData)
      
      if (!token) {
        toast.error('Token não gerado.')
        setCarregando(false)
        return
      }

      await setDoc(doc(db, 'cartoes', usuario.uid), {
        uid: usuario.uid,
        nome: form.nome,
        payment_token: token,
        bandeira: form.bandeira,
        numeroFinal: form.numero.slice(-4),
        criadoEm: new Date()
      })

      toast.success('Cartão salvo com sucesso!')
      setAbrirCadastroCartao(false)
      setForm({ nome: '', numero: '', validade: '', cvv: '', bandeira: '' })
      carregarCartaoSalvo()
      
    } catch (error) {
      console.error('[gerarTokenCartao] erro:', error)
      toast.error(error.message || 'Erro ao gerar token do cartão.')
    } finally {
      setCarregando(false)
    }
  }

  const carregarCartaoSalvo = async () => {
    try {
      const docSnap = await getDoc(doc(db, 'cartoes', usuario.uid))
      if (docSnap.exists()) {
        setCartaoSalvo(docSnap.data())
      }
    } catch (err) {
      console.error('[carregarCartaoSalvo] erro:', err)
    }
  }

  useEffect(() => {
    if (usuario?.uid) {
      carregarCartaoSalvo()
    }
  }, [usuario])

  return (
    <div className="bg-green-100 text-green-900 p-4 mt-4 rounded-xl shadow-md">
      <h3 className="text-lg font-semibold mb-2">✅ Documentos verificados com sucesso.</h3>

      <div className="mt-4">
        <h4 className="text-md font-semibold mb-2">💳 Meus Cartões</h4>
        {cartaoSalvo ? (
          <p className="text-sm mb-2">
            Cartão final <strong>{cartaoSalvo.numeroFinal}</strong> ({cartaoSalvo.bandeira})
          </p>
        ) : (
          <p className="text-sm text-gray-600 mb-2">Nenhum cartão cadastrado.</p>
        )}
        <button
          onClick={() => setAbrirCadastroCartao(true)}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded text-sm"
        >
          + Cadastrar Cartão
        </button>
      </div>

      {abrirCadastroCartao && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-orange-700">Cadastrar Cartão</h3>
              <button
                onClick={() => setAbrirCadastroCartao(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Fechar"
              >✕</button>
            </div>
            <input
              type="text"
              placeholder="Nome no cartão"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <input
              type="text"
              placeholder="Número do cartão (ex: 4111 1111 1111 1111)"
              name="numero"
              value={form.numero}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="MM/AA"
                name="validade"
                value={form.validade}
                onChange={handleChange}
                className="w-1/2 border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="CVV"
                name="cvv"
                value={form.cvv}
                onChange={handleChange}
                className="w-1/2 border rounded px-3 py-2"
              />
            </div>
            <select
              name="bandeira"
              value={form.bandeira}
              onChange={(e) => setForm({ ...form, bandeira: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Selecione a bandeira</option>
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
              <option value="elo">Elo</option>
              <option value="hipercard">Hipercard</option>
            </select>
            <button
              onClick={gerarTokenCartao}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded disabled:opacity-50"
              disabled={carregando}
            >
              {carregando ? 'Processando...' : 'Salvar Cartão'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}