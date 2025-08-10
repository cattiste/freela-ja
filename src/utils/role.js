// src/utils/role.js
export function resolveRole(perfil = {}) {
  // Admin “vence”
  if (perfil?.isAdmin === true || perfil?.role === 'admin') return 'admin'

  // Modelo novo
  if (perfil?.tipoUsuario === 'freela') return 'freela'
  if (perfil?.tipoConta === 'comercial') {
    if (perfil?.subtipoComercial === 'estabelecimento') return 'estabelecimento'
    if (perfil?.subtipoComercial === 'pf') return 'pessoa_fisica'
  }

  // Legado
  if (perfil?.tipo === 'freela') return 'freela'
  if (perfil?.tipo === 'estabelecimento') return 'estabelecimento'
  if (perfil?.tipo === 'pessoa_fisica') return 'pessoa_fisica'

  // Fallback seguro: nunca lançar erro
  return 'pessoa_fisica'
}
