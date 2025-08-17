import { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/firebase';

export function useMediaAvaliacoes(uid) {
  const [media, setMedia] = useState(null);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, 'avaliacoes'),
      where('avaliadoUid', '==', uid)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const avals = snapshot.docs.map(doc => doc.data());
      if (avals.length === 0) {
        setMedia(null);
        return;
      }

      const soma = avals.reduce((acc, a) => acc + (a.nota || 0), 0);
      setMedia(soma / avals.length);
    });

    return () => unsub();
  }, [uid]);

  return media;
}
