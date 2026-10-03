export function formatCurrency(amount: number | string): string {
  return `S/ ${Number(amount).toFixed(2)}`
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return date.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "2-digit" })
}

// Fecha local en formato "YYYY-MM-DD" desplazada `offsetDays` días desde hoy
export function isoDate(offsetDays = 0): string {
  const d = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000)
  return d.toISOString().split("T")[0]
}

// Convierte "Wifi, TV,, Jacuzzi" en ["Wifi", "TV", "Jacuzzi"]
export function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}
