import React, { useState } from 'react'
import axios from 'axios'

export default function ModalConfirmarPagamento({ chamada, onClose }) {
  const [senha, setSenha] = useState("")
  const [etapa, setEtapa] = useState("senha") // senha | pagando | sucesso | erro
  const [mensagem, setMensagem] = useState("")

  const confirmarPagamento = async () => {
    try {
      setEtapa("pagando")
      const uid = chamada.estabelecimentoUid || chamada.contratanteUid

      // 1. Confirma a senha do contratante
      const r1 = await axios.post("http://localhost:8080/confirmarPagamento", {
        uid,
        senha
      })

      if (!r1.data.sucesso) {
        setMensagem(r1.data.erro || "Erro ao confirmar senha")
        setEtapa("erro")
        return
      }

      // 2. Executa o pagamento
      const r2 = await axios.post("http://localhost:8080/pagarFreela", {
        chamadaId: chamada.id
      })

      if (!r2.data.sucesso) {
        setMensagem(r2.data.erro || "Erro ao pagar chamada")
        setEtapa("erro")
        return
      }

      setEtapa("sucesso")
      setMensagem("Pagamento realizado com sucesso!")

    } catch (err) {
      console.error(err)
      setMensagem("Erro inesperado")
      setEtapa("erro")
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold text-orange-700">Confirmar pagamento</h2>

        {etapa === "senha" && (
          <>
            <p>Digite sua senha de 4 dígitos para confirmar:</p>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="border px-4 py-2 rounded w-full"
              maxLength={4}
            />
            <div className="flex justify-end space-x-2">
              <button onClick={onClose} className="text-gray-600">Cancelar</button>
              <button onClick={confirmarPagamento} className="bg-orange-600 text-white px-4 py-2 rounded">
                Confirmar
              </button>
            </div>
          </>
        )}

        {etapa === "pagando" && <p>Processando pagamento... 🔄</p>}

        {etapa === "sucesso" && (
          <>
            <p className="text-green-600 font-semibold">{mensagem}</p>
            <button onClick={onClose} className="bg-green-600 text-white px-4 py-2 rounded">
              Fechar
            </button>
          </>
        )}

        {etapa === "erro" && (
          <>
            <p className="text-red-600 font-semibold">{mensagem}</p>
            <button onClick={() => setEtapa("senha")} className="bg-gray-300 px-4 py-2 rounded">
              Tentar novamente
            </button>
          </>
        )}
      </div>
    </div>
  )
}
