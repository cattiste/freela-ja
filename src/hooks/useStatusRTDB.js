// src/hooks/useStatusRTDB.js
import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/firebase';

export default function useStatusRTDB() {
  const [usuariosOnline, setUsuariosOnline] = useState({});

  useEffect(() => {
    const statusRef = ref(rtdb, '/status');

    const unsubscribe = onValue(statusRef, (snapshot) => {
      const data = snapshot.val() || {};
      setUsuariosOnline(data);
    });

    return () => unsubscribe();
  }, []);

  return usuariosOnline;
}
