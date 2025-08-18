// src/hooks/useStatusRTDB.js
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/firebase';

export default function useStatusRTDB() {
  const [usuariosOnline, setUsuariosOnline] = useState({});

  useEffect(() => {
  const statusRef = ref(rtdb, `status/${uid}`);
  console.log('[RTDB] Registrando listener para status...');
  onValue(statusRef, (snap) => {
    console.log('[RTDB] status atualizado:', snap.val());
    setStatus(snap.val());
  });
}, []);

    return () => unsubscribe();
  }, []);

  return usuariosOnline;
}
