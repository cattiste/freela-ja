// src/utils/haversine.js
export function haversineDistance(a = {}, b = {}) {
  const lat1 = a.latitude ?? a.lat
  const lon1 = a.longitude ?? a.lng
  const lat2 = b.latitude ?? b.lat
  const lon2 = b.longitude ?? b.lng
  if ([lat1, lon1, lat2, lon2].some(v => typeof v !== 'number')) return null

  const toRad = v => (v * Math.PI) / 180
  const R = 6371
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const s = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2)**2
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
  return R * c // km
}
