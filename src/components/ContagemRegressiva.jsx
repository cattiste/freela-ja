import React, { useEffect, useState } from 'react'

export default function ContagemRegressiva({ aceitaEm }) {
  const [tempoRestante, setTempoRestante] = useState(600) // 10 minutos em segundos

  useEffect(() => {
    const interval = setInterval(() => {
      const agora = Date.now()
      const diff = Math.max(0, Math.floor((aceitaEm + 600000 - agora) / 1000))
      setTempoRestante(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [aceitaEm])

  const minutos = String(Math.floor(tempoRestante / 60)).padStart(2, '0')
  const segundos = String(tempoRestante % 60).padStart(2, '0')

  if (tempoRestante <= 0) return null

  return (
    <p className="text-sm text-orange-500 text-center font-semibold">
      ⏳ Aguardando pagamento: {minutos}:{segundos}
    </p>
  )
}
