export function haversineDistance(coord1, coord2) {
  const toRad = (value) => (value * Math.PI) / 180

  const R = 6371 // Raio da Terra em km

  const lat1 = coord1.latitude || coord1.lat
  const lon1 = coord1.longitude || coord1.lng
  const lat2 = coord2.latitude || coord2.lat
  const lon2 = coord2.longitude || coord2.lng

  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  const distance = R * c

  return distance // em quilômetros
}
