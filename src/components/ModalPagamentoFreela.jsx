import { useState } from "react";

export default function ModalPagamentoFreela({ chamada, onClose }) {
  const [status, setStatus] = useState("pendente");
  const [loading, setLoading] = useState(false);

  const gerarPix = async () => {
    try {
      setLoading(true);
      setStatus("pendente");

      if (!chamada?.id) {
        throw new Error("ID da chamada não encontrado");
      }

      const response = await fetch(
        "https://api-kbaliknhja-rj.a.run.app/api/pix/cobrar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chamadaId: chamada.id }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao gerar cobrança Pix");
      }

      setStatus("ok");
    } catch (error) {
      console.error("Erro ao gerar Pix:", error);
      setStatus("erro");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-orange-700 mb-4">
          Pagamento via Pix
        </h2>

        {status === "pendente" && (
          <p className="text-gray-600 mb-4">Aguardando geração do PIX...</p>
        )}
        {status === "erro" && (
          <p className="text-red-600 mb-4">
            ❌ Erro ao gerar Pix. Tente novamente.
          </p>
        )}
        {status === "ok" && (
          <p className="text-green-600 mb-4">
            ✅ Pix gerado com sucesso! Verifique seu aplicativo bancário.
          </p>
        )}

        <div className="flex gap-2">
          {status === "pendente" && (
            <button
              onClick={gerarPix}
              disabled={loading}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 disabled:opacity-50"
            >
              {loading ? "Gerando..." : "Gerar Pix"}
            </button>
          )}
          <button
            onClick={onClose}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
