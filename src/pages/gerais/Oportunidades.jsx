import { Helmet } from 'react-helmet'
import React, { useEffect, useMemo, useState } from 'react'
import { collection, query, getDocs, limit /*, where */ } from 'firebase/firestore'
import { db } from '@/firebase'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/ui/Input'
import { toast } from 'react-hot-toast'

export default function Oportunidades() {
  const [vagas, setVagas] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [filtro, setFiltro] = useState('')
  const [cidade, setCidade] = useState('')
  const [tipo, setTipo] = useState('')
  const [valorMinimo, setValorMinimo] = useState('')

  const navigate = useNavigate()

  useEffect(() => {
    let ativo = true
    async function carregarVagas() {
      setCarregando(true)
      setErro('')
      try {
        // Dica: se quiser filtrar no servidor depois, descomente o where adequado
        // const q = query(collection(db, 'vagas'), where('ativo', '==', true), limit(150))
        const q = query(collection(db, 'vagas'), limit(150))
        const snapshot = await getDocs(q)
        if (!ativo) return
        const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setVagas(lista || [])
      } catch (err) {
        console.error('Erro ao buscar vagas:', err)
        setErro('Não foi possível carregar as vagas agora.')
        toast.error('Falha ao carregar vagas.')
      } finally {
        if (ativo) setCarregando(false)
      }
    }
    carregarVagas()
    return () => { ativo = false }
  }, [])

  const valorMin = useMemo(() => {
    const n = Number(String(valorMinimo).replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }, [valorMinimo])

  const vagasFiltradas = useMemo(() => {
    const texto = (s) => (s || '').toString().toLowerCase().trim()
    const filtroTxt = texto(filtro)
    const cidadeTxt = texto(cidade)
    const tipoTxt = texto(tipo)

    return vagas.filter((vaga) => {
      const titulo = texto(vaga.titulo)
      const descricao = texto(vaga.descricao)
      const cidadeVaga = texto(vaga.cidade)
      const tipoVaga = texto(vaga.tipo)
      const diaria = Number(vaga?.valorDiaria) || Number(vaga?.salario) || 0

      const passaTexto = !filtroTxt || titulo.includes(filtroTxt) || descricao.includes(filtroTxt)
      const passaCidade = !cidadeTxt || cidadeVaga.includes(cidadeTxt)
      const passaTipo = !tipoTxt || tipoVaga.includes(tipoTxt)
      const passaValor = !valorMin || diaria >= valorMin

      return passaTexto && passaCidade && passaTipo && passaValor
    })
  }, [vagas, filtro, cidade, tipo, valorMin])

  return (
    <>
      <Helmet>
        <title>Oportunidades | Freela Já</title>
        <meta
          name="description"
          content="Veja as vagas mais recentes e oportunidades de trabalho como freelancer perto de você."
        />
      </Helmet>

      <div
        className="min-h-screen bg-cover bg-center p-6"
        style={{
          backgroundImage: "url('/img/fundo-login.jpg')",
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 max-w-7xl mx-auto shadow-xl">
          <div className="max-w-7x2 mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-blue-800">🚀 Oportunidades em Alta</h1>

            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <Input
                placeholder="🔍 Buscar vaga ou descrição..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              <Input
                placeholder="📍 Cidade"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
              />
              <Input
                placeholder="📅 Tipo (ex: Garçom)"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              />
              <Input
                placeholder="💰 Mínimo R$"
                value={valorMinimo}
                onChange={(e) => setValorMinimo(e.target.value)}
                type="number"
                inputMode="decimal"
              />
            </div>

            {carregando && (
              <p className="text-gray-600">Carregando vagas...</p>
            )}

            {!carregando && erro && (
              <p className="text-red-600">{erro}</p>
            )}

            {!carregando && !erro && vagasFiltradas.length === 0 && (
              <p className="text-gray-600">🔍 Nenhuma vaga com os filtros atuais.</p>
            )}

            {!carregando && !erro && vagasFiltradas.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vagasFiltradas.map((vaga) => (
                  <div
                    key={vaga.id}
                    className="bg-white p-5 rounded-xl shadow hover:shadow-xl cursor-pointer transition border-l-4 border-blue-500"
                    onClick={() => {
                      toast('Cadastre-se para se candidatar às vagas!')
                      setTimeout(() => navigate('/cadastrofreela'), 1200)
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-bold text-blue-700">{vaga.titulo || 'Oportunidade'}</h2>
                      {vaga.urgente && (
                        <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded">🔥 Urgente</span>
                      )}
                    </div>

                    {vaga.empresa && <p className="text-gray-700">🏢 {vaga.empresa}</p>}
                    {vaga.cidade && <p className="text-gray-700">📍 {vaga.cidade}</p>}

                    <p className="text-gray-700">
                      💰 {vaga.valorDiaria
                        ? `R$ ${vaga.valorDiaria}`
                        : (vaga.salario ? `R$ ${vaga.salario}` : 'a combinar')}
                    </p>

                    {vaga.descricao && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-3">{vaga.descricao}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
