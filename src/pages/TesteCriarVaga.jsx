// src/pages/TesteCriarVaga.jsx
import React, { useEffect } from 'react'
import { collection, addDoc } from 'firebase/firestore'
<<<<<<< HEAD
import { db } from '../firebase'
=======
import { db } from '@/firebase'
>>>>>>> dcb7593 (Inicializando repositório com código atualizado)

export default function TesteCriarVaga() {
  useEffect(() => {
    async function criarVaga() {
      try {
        await addDoc(collection(db, 'vagas'), {
          titulo: 'Atendente de Balcão',
          empresa: 'Padaria Central',
          cidade: 'São Paulo',
          tipo: 'CLT',
          salario: 'R$ 1.500,00',
          descricao: 'Atendimento ao cliente, organização da loja.',
          emailContato: 'contato@padariacentral.com'
        })
        alert('Vaga criada com sucesso!')
      } catch (error) {
        alert('Erro ao criar vaga: ' + error.message)
      }
    }

    criarVaga()
  }, [])

  return <div>Inserindo vaga no Firestore... aguarde</div>
}
