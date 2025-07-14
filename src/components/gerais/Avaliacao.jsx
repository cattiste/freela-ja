// pages/Avaliacao.jsx
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth, db } from '@/firebase' // import da instância do Firebase
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

function Avaliacao() {
  const { tipo, id } = useParams(); // tipo = freela ou estabelecimento, id = avaliado
  const { user } = useAuth(); // usuário logado que está avaliando
  const [avaliado, setAvaliado] = useState(null);
  const [nota, setNota] = useState(5);
  const [comentario, setComentario] = useState('');
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ref = doc(db, tipo === 'freela' ? 'freelas' : 'estabelecimentos', id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setAvaliado(snap.data());
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
      }
    };

    fetchData();
  }, [tipo, id]);

  const enviarAvaliacao = async () => {
    try {
      const collectionRef = collection(db, tipo === 'freela' ? 'avaliacoes_freelas' : 'avaliacoes_estabelecimentos');
      await addDoc(collectionRef, {
        avaliadoId: id,
        avaliadorId: user.uid,
        nota,
        comentario,
        data: serverTimestamp()
      });
      setEnviado(true);
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
    }
  };

  if (!avaliado) return <p>Carregando dados...</p>;

  if (enviado) return <p className="text-green-600 font-bold">Avaliação enviada com sucesso! ✅</p>;

  return (
    <div className="max-w-md mx-auto p-4 bg-white shadow-md rounded-lg mt-8">
      <h2 className="text-xl font-bold mb-4">
        Avaliar {tipo === 'freela' ? 'Freelancer' : 'Estabelecimento'}: {avaliado.nome}
      </h2>

      <label className="block mb-2 font-semibold">Nota:</label>
      <select
        value={nota}
        onChange={(e) => setNota(parseInt(e.target.value))}
        className="w-full border rounded p-2 mb-4"
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <option key={n} value={n}>{n} estrela{n > 1 && 's'}</option>
        ))}
      </select>

      <label className="block mb-2 font-semibold">Comentário:</label>
      <textarea
        value={comentario}
        onChange={(e) => setComentario(e.target.value)}
        className="w-full border rounded p-2 h-24 mb-4"
        placeholder="Escreva seu feedback..."
      />

      <button
        onClick={enviarAvaliacao}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Enviar Avaliação
      </button>
    </div>
  );
}

export default Avaliacao;
