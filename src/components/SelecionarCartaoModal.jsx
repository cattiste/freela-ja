import React, { useEffect, useState } from 'react'
import { Dialog } from '@headlessui/react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/context/AuthContext'
import { toast } from 'react-hot-toast'

export default function SelecionarCartaoModal({ chamadaId, valor, onClose }) {
  const { usuario } = useAuth()
  const [cartoes, setCartoes] = useState([])
  const [selecionado, setSelecionado] = useState(null)
  const [carregando, setCarregando] = useState(false)

  useEffect(() => {
    if (!usuario?.uid) return
    const fetchCartoes = async () => {
      const ref = collection(db, 'usuarios', usuario.uid, 'cartoes')
      const snap = await getDocs(ref)
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setCartoes(lista)
    }
    fetchCartoes()
  }, [usuario])

  const pagar = async () => {
    if (!selecionado) return toast.error('Selecione um cartão')
    setCarregando(true)

    try {
      const response = await fetch(`https://southamerica-east1-freelaja-web-50254.cloudfunctions.net/api/cobrarCartaoAoAceitar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chamadaId,
          valor,
          payment_token: selecionado.payment_token,
          ultimos4: selecionado.ultimos4
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast.success('Pagamento realizado com sucesso!')
        onClose()
      } else {
        throw new Error(data?.erro || 'Erro ao processar pagamento')
      }
    } catch (err) {
      console.error(err)
      toast.error(err.message)
    } finally {
      setCarregando(false)
    }
  }

  return (
    <Dialog open={true} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4 bg-black/30">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold mb-4">Escolher Cartão</Dialog.Title>

          {cartoes.length === 0 ? (
            <p>Nenhum cartão salvo.</p>
          ) : (
            <ul className="space-y-2 mb-4">
              {cartoes.map((cartao) => (
                <li
                  key={cartao.id}
                  className={`p-3 border rounded-md cursor-pointer ${
                    selecionado?.id === cartao.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelecionado(cartao)}
                >
                  •••• {cartao.ultimos4}
                </li>
              ))}
            </ul>
          )}

          <div className="flex justify-end gap-2">
            <button
              className="px-4 py-2 rounded bg-gray-200"
              onClick={onClose}
              disabled={carregando}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={pagar}
              disabled={carregando}
            >
              {carregando ? 'Pagando...' : 'Pagar'}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
