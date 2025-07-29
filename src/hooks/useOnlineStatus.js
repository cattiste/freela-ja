export function useUserRealtimeStatus(uid) {
  const [status, setStatus] = useState({ online: false, lastSeen: null })

  useEffect(() => {
    if (!uid) return
    const db = getDatabase()
    const refUser = ref(db, 'users/' + uid)

    return onValue(refUser, (snap) => {
      const data = snap.val() || {}
      setStatus({
        online: !!data.online,
        lastSeen: data.lastSeen || null
      })
    })
  }, [uid])

  return status
}
