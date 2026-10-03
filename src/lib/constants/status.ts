// Etiquetas y colores de todos los estados que muestra la app (cliente y admin).
export type StatusConfig = {
  label: string
  className: string
}

const GREEN = "bg-emerald-100 text-emerald-700 border-emerald-200"
const AMBER = "bg-amber-100 text-amber-700 border-amber-200"
const RED = "bg-red-100 text-red-700 border-red-200"
const BLUE = "bg-blue-100 text-blue-700 border-blue-200"
const SKY = "bg-sky-100 text-sky-700 border-sky-200"
const PURPLE = "bg-purple-100 text-purple-700 border-purple-200"
const GRAY = "bg-slate-100 text-slate-600 border-slate-200"

export const ROOM_STATUS: Record<string, StatusConfig> = {
  available: { label: "Disponible", className: GREEN },
  occupied: { label: "Ocupada", className: RED },
  maintenance: { label: "Mantenimiento", className: AMBER },
  cleaning: { label: "Limpieza", className: SKY },
}

export const RESERVATION_STATUS: Record<string, StatusConfig> = {
  pending: { label: "Pendiente", className: AMBER },
  confirmed: { label: "Confirmada", className: GREEN },
  checked_in: { label: "En estadía", className: BLUE },
  checked_out: { label: "Finalizada", className: GRAY },
  cancelled: { label: "Cancelada", className: RED },
}

export const PAYMENT_STATUS: Record<string, StatusConfig> = {
  pending: { label: "Pendiente", className: AMBER },
  paid: { label: "Pagado", className: GREEN },
  refunded: { label: "Reembolsado", className: PURPLE },
}

// Estado genérico de registros maestros ("A" activo / "I" inactivo)
export const RECORD_STATUS: Record<string, StatusConfig> = {
  active: { label: "Activo", className: GREEN },
  inactive: { label: "Inactivo", className: GRAY },
}

// El backend a veces devuelve los valores en español
const ALIASES: Record<string, string> = {
  disponible: "available",
  ocupado: "occupied",
  ocupada: "occupied",
  mantenimiento: "maintenance",
  limpieza: "cleaning",
  dirty: "cleaning",
  pendiente: "pending",
  confirmada: "confirmed",
  cancelada: "cancelled",
  pagado: "paid",
  reembolsado: "refunded",
}

export function normalizeStatus(status?: string | null): string {
  const key = (status ?? "").toLowerCase()
  return ALIASES[key] ?? key
}

export function getStatusConfig(map: Record<string, StatusConfig>, status?: string | null): StatusConfig {
  return map[normalizeStatus(status)] ?? { label: status || "N/A", className: GRAY }
}

// Registros sin estado o con "A"/"1" se consideran activos
export function isActiveRecord(status?: string | null): boolean {
  return !status || ["A", "1"].includes(status.toUpperCase())
}
