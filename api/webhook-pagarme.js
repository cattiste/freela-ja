import { db } from '@/utils/firebase' // ajuste o import conforme sua estrutura
import { doc, updateDoc } from 'firebase/firestore'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'Método não permitido' })
  }

  try {
    const evento = req.body

    if (evento.status !== 'paid') {
      return res.status(200).json({ msg: 'Pagamento não finalizado ainda.' })
    }

    const tipo = evento.metadata?.tipo
    const referenciaId = evento.metadata?.referenciaId

    if (!tipo || !referenciaId) {
      return res.status(400).json({ erro: 'Metadados incompletos.' })
    }

    const ref = doc(db, tipo === 'evento' ? 'eventos' : 'chamadas', referenciaId)
    await updateDoc(ref, { status: 'pago' })

    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[WEBHOOK ERRO]', err)
    return res.status(500).json({ erro: 'Erro no processamento do webhook' })
  }
}
