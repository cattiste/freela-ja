export default function AgendaCompleta({ freela }) {
  return (
    <div>
      <h1>Testando renderização</h1>
      <p>{freela?.nome || 'Sem nome'}</p>
    </div>
  )
}
