import React, { useEffect, useState } from 'react'

function toMillis(v) {
  if (!v) return null
  if (typeof v === 'number') return v
  if (v instanceof Date) return v.getTime()
  if (typeof v?.toMillis === 'function') return v.toMillis()
  if (typeof v?.seconds === 'number') return v.seconds * 1000
  if (typeof v?._seconds === 'number') return v._seconds * 1000
  return null
}

export default function ContagemRegressiva({ aceitaEm }) {
  const base = toMillis(aceitaEm)
  const [rest, setRest] = useState(() => {
    if (!base) return 0
    const diff = base + 600_000 - Date.now()
    return Math.max(0, Math.floor(diff / 1000))
  })

  useEffect(() => {
    const start = toMillis(aceitaEm)
    if (!start) return
    const endMs = start + 600_000
    const id = setInterval(() => {
      const diff = endMs - Date.now()
      setRest(Math.max(0, Math.floor(diff / 1000)))
    }, 1000)
    return () => clearInterval(id)
  }, [aceitaEm])

  if (!base || rest <= 0) return null

  const m = String(Math.floor(rest / 60)).padStart(2, '0')
  const s = String(rest % 60).padStart(2, '0')
  return (
    <p className="text-sm text-orange-500 text-center font-semibold">
      ⏳ Aguardando pagamento: {m}:{s}
    </p>
  )
}
