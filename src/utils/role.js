// src/utils/role.js
export function resolveRole(perfil = {}) {
  if (perfil?.isAdmin === true || perfil?.role === 'admin') return 'admin'
  if (perfil?.tipoUsuario === 'freela') return 'freela'
  if (perfil?.tipoConta === 'comercial') {
    if (perfil?.subtipoComercial === 'estabelecimento') return 'estabelecimento'
    if (perfil?.subtipoComercial === 'pf') return 'pessoa_fisica'
  }
  if (perfil?.tipo === 'freela') return 'freela'
  if (perfil?.tipo === 'estabelecimento') return 'estabelecimento'
  if (perfil?.tipo === 'pessoa_fisica') return 'pessoa_fisica'
  return 'pessoa_fisica' // fallback seguro
}
