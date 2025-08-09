import { createContext, useContext, useEffect, useState } from 'react'
import { auth, db } from '../firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)

  // Tipos de usuário permitidos
  const TIPOS_USUARIO = {
    PESSOA_FISICA: ['pessoa_fisica', 'pf'],
    FREELA: ['freela', 'freelancer'],
    ESTABELECIMENTO: ['estabelecimento', 'empresa']
  }

  const verificarTipoUsuario = (tipo) => {
    if (!tipo) return false
    return Object.values(TIPOS_USUARIO).some(tipos => tipos.includes(tipo.toLowerCase()))
  }

  const carregarDadosUsuario = async (usuarioAuth) => {
    try {
      // Força renovação do token
      const token = await usuarioAuth.getIdToken(true)
      
      // Busca dados adicionais no Firestore
      const docRef = doc(db, 'usuarios', usuarioAuth.uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('Perfil não encontrado no banco de dados')
      }

      const dadosUsuario = docSnap.data()
      
      // Verifica se o tipo de usuário é válido
      if (!verificarTipoUsuario(dadosUsuario.tipo)) {
        await signOut(auth)
        throw new Error('Tipo de usuário inválido')
      }

      // Monta objeto completo do usuário
      const usuarioCompleto = {
        uid: usuarioAuth.uid,
        email: usuarioAuth.email,
        emailVerificado: usuarioAuth.emailVerified,
        token,
        ...dadosUsuario
      }

      setUsuario(usuarioCompleto)
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioCompleto))
      setErro(null)
      return usuarioCompleto

    } catch (erro) {
      console.error('Erro ao carregar dados do usuário:', erro)
      setErro(erro.message)
      
      // Fallback básico se necessário
      const usuarioBasico = {
        uid: usuarioAuth.uid,
        email: usuarioAuth.email,
        emailVerificado: usuarioAuth.emailVerified
      }
      
      setUsuario(usuarioBasico)
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioBasico))
      return usuarioBasico
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (usuarioAuth) => {
      setCarregando(true)
      
      if (usuarioAuth) {
        await carregarDadosUsuario(usuarioAuth)
      } else {
        setUsuario(null)
        localStorage.removeItem('usuarioLogado')
        setErro(null)
      }
      
      setCarregando(false)
    })

    return () => unsubscribe()
  }, [])

  const atualizarUsuario = async () => {
    if (!auth.currentUser) return
    
    setCarregando(true)
    try {
      const usuarioAtualizado = await carregarDadosUsuario(auth.currentUser)
      setCarregando(false)
      return usuarioAtualizado
    } catch (erro) {
      setCarregando(false)
      throw erro
    }
  }

  const fazerLogout = async () => {
    try {
      await signOut(auth)
      setUsuario(null)
      localStorage.removeItem('usuarioLogado')
      setErro(null)
    } catch (erro) {
      setErro('Erro ao fazer logout')
      console.error('Erro no logout:', erro)
    }
  }

  // Verifica se o usuário atual é pessoa física
  const isPessoaFisica = () => {
    return usuario && TIPOS_USUARIO.PESSOA_FISICA.includes(usuario.tipo?.toLowerCase())
  }

  return (
    <AuthContext.Provider value={{ 
      usuario, 
      carregando, 
      erro,
      atualizarUsuario, 
      fazerLogout,
      isPessoaFisica
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}