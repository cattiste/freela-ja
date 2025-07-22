import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase';

export function useOnlineStatus(uid) {
  const [online, setOnline] = useState(false);
  const [ultimaAtividade, setUltimaAtividade] = useState(null);
  const [diferencaSegundos, setDiferencaSegundos] = useState(null);

  useEffect(() => {
  if (!uid) return;

  const docRef = doc(db, 'usuarios', uid);

  const unsub = onSnapshot(docRef, (snap) => {
    if (!snap.exists()) {
      console.warn(`[Status] Usuário ${uid} não encontrado`);
      setOnline(false);
      setDiferencaSegundos(null);
      return;
    }

    const data = snap.data();
    const ts = data.ultimaAtividade;
    console.log(`[Status] ${uid} - Timestamp bruto:`, ts);

    setUltimaAtividade(ts);

    if (!ts) {
      setOnline(false);
      setDiferencaSegundos(null);
      return;
    }

    const agora = Date.now();
    const ultima = ts.toMillis();
    const diff = Math.floor((agora - ultima) / 1000);

    console.log(`[Status] ${uid} - Última atividade há ${diff}s`);

    setOnline(diff < 30);
    setDiferencaSegundos(diff);
  });

  return () => unsub();
}, [uid]);

  return { online, ultimaAtividade, diferencaSegundos };
}
