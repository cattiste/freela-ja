import { useEffect, useState } from 'react'
import { db } from '@/services/firebaseConfig'
import { addDoc, collection, doc, getDoc } from 'firebase/firestore'
import { toast } from 'react-toastify'
import { useAuth } from '@/context/AuthContext'
import { loadEfipayScript } from '@/utils/loadEfipayScript'
import { getPaymentTokenEfipay } from '@/utils/efipay'

const CartoesContratante = () => {
  const { usuario } = useAuth()
  const [abrirCadastroCartao, setAbrirCadastroCartao] = useState(false)
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [numero, setNumero] = useState('')
  const [validade, setValidade] = useState('')
  const [cvv, setCvv] = useState('')
  const [senha, setSenha] = useState('')
  const [bandeira, setBandeira] = useState('')
  const [efiPronta, setEfiPronta] = useState(false)

  useEffect(() => {
  const initEfipay = async () => {
    try {
      await loadEfipayScript();
      const ctx = await import('@/utils/efipay').then((mod) => mod.efipayReady());
      console.log('✅ SDK EfiPay pronta!', ctx);
      setEfiPronta(true);
    } catch (err) {
      console.error('Erro ao inicializar SDK EfiPay:', err);
      toast.error('Erro ao carregar sistema de pagamento.');
    }
  };

  initEfipay();
}, []);


  const handleSalvarCartao = async () => {
    if (!efiPronta) {
      toast.warn('Aguarde o carregamento do sistema de pagamento.')
      return
    }

    if (!nome || !cpf || !numero || !validade || !cvv || !senha) {
      toast.warn('Preencha todos os campos.')
      return
    }

    const [mes, ano] = validade.split('/')

    try {
      const token = await getPaymentTokenEfipay({
        number: numero.replace(/\s/g, ''),
        cvv,
        expiration_month: mes,
        expiration_year: '20' + ano,
        holder: nome,
        brand: bandeira || 'mastercard'
      })

      if (!token) {
        toast.error('Erro ao gerar token do cartão.')
        return
      }

      await addDoc(collection(db, 'cartoes'), {
        uid: usuario.uid,
        token,
        numeroFinal: numero.slice(-4),
        bandeira: bandeira || 'mastercard',
        nome,
        cpf,
        senha,
        criadoEm: new Date()
      })

      toast.success('Cartão salvo com sucesso.')
      setAbrirCadastroCartao(false)
    } catch (error) {
      console.error('Erro ao salvar cartão:', error)
      toast.error('Erro ao salvar cartão.')
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">💳 Meus Cartões</h2>

      <button
        className="bg-orange-600 text-white px-4 py-2 rounded mb-4"
        onClick={() => setAbrirCadastroCartao(true)}
      >
        + Cadastrar Cartão
      </button>

      {abrirCadastroCartao && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-4 space-y-3">
            <h3 className="text-orange-700 font-semibold text-lg">Cadastrar Cartão</h3>

            <input
              type="text"
              placeholder="Nome do titular"
              className="w-full border p-2 rounded"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <input
              type="text"
              placeholder="CPF do titular"
              className="w-full border p-2 rounded"
              value={cpf}
              onChange={(e) => setCpf(e.target.value)}
            />
            <input
              type="text"
              placeholder="Número do cartão"
              className="w-full border p-2 rounded"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
            />
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Validade (MM/AA)"
                className="w-1/2 border p-2 rounded"
                value={validade}
                onChange={(e) => setValidade(e.target.value)}
              />
              <input
                type="text"
                placeholder="CVV"
                className="w-1/2 border p-2 rounded"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
              />
            </div>
            <input
              type="text"
              placeholder="Bandeira (ex: mastercard)"
              className="w-full border p-2 rounded"
              value={bandeira}
              onChange={(e) => setBandeira(e.target.value)}
            />
            <input
              type="password"
              placeholder="Senha de pagamento (4-6 dígitos)"
              className="w-full border p-2 rounded"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />

            <div className="flex justify-between">
              <button
                onClick={() => setAbrirCadastroCartao(false)}
                className="px-4 py-2 rounded border"
              >
                Fechar
              </button>
              <button
                onClick={handleSalvarCartao}
                className={`px-4 py-2 rounded text-white ${
                 efiPronta ? 'bg-orange-600 hover:bg-orange-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!efiPronta}
              >
                Salvar Cartão
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CartoesContratante
