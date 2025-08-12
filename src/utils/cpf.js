// src/utils/cpf.js

// mantém só dígitos
export function apenasNumeros(v = '') {
  return String(v).replace(/\D/g, '')
}

// máscara "000.000.000-00" conforme digita
export function formatarCPF(v = '') {
  const d = apenasNumeros(v).slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

// valida CPF por dígitos verificadores
export function validarCPF(input = '') {
  const cpf = apenasNumeros(input)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false // rejeita sequências (000…, 111…)

  // 1º DV
  let soma = 0
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * (10 - i)
  let dv1 = 11 - (soma % 11)
  dv1 = dv1 >= 10 ? 0 : dv1

  // 2º DV
  soma = 0
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * (11 - i)
  let dv2 = 11 - (soma % 11)
  dv2 = dv2 >= 10 ? 0 : dv2

  return dv1 === parseInt(cpf[9], 10) && dv2 === parseInt(cpf[10], 10)
}
