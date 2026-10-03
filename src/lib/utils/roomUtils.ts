const DAY_MS = 1000 * 60 * 60 * 24

// Noches entre dos fechas "YYYY-MM-DD" (0 si faltan o el rango es inválido).
// Se parsea en UTC para que los cambios de horario no conviertan 1 día en 0.99.
export function getNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0
  const start = Date.parse(`${checkIn.split("T")[0]}T00:00:00Z`)
  const end = Date.parse(`${checkOut.split("T")[0]}T00:00:00Z`)
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0
  return Math.round((end - start) / DAY_MS)
}

export function calculateTotalAmount(pricePerNight: number, nights: number): number {
  return Number((Number(pricePerNight) * nights).toFixed(2))
}
