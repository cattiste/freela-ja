// src/components/ModalPagamentoEscolha.jsx
import { useState } from 'react'
//import PagamentoCartaoModal from './PagamentoCartaoModal'
import GerarPixModal from './GerarPixModal'

export default function ModalPagamentoEscolha({ open, onClose, chamada }) {
  const [metodo, setMetodo] = useState(null)

  const resetar = () => {
    setMetodo(null)
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-center text-orange-700">
          Como deseja pagar o freela?
        </h2>

        {!metodo && (
          <div className="flex flex-col space-y-3">           
            </button>
            <button
              onClick={() => setMetodo('pix')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              🔁 Pagar com Pix
            </button>
            <button
              onClick={resetar}
              className="text-gray-500 text-sm underline mt-4"
            >
              Cancelar
            </button>
          </div>
        )}

        
        {metodo === 'pix' && (
          <GerarPixModal chamada={chamada} onClose={resetar} inline />
        )}
      </div>
    </div>
  )
}
