import { API_BASE_URL } from "../api"
import { Room } from "../types/room"

// Asegúrate de que ESTA función devuelva un array plano de rooms
export async function fetchRooms(): Promise<Room[]> {
  const res = await fetch(`${API_BASE_URL}/rooms`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store", // evita cache raro
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || `HTTP ${res.status}`)
  }

  const payload = await res.json()
  // Normaliza: si el backend devuelve {data:[...]} o {items:[...]} o directamente [...]
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.items)) return payload.items
  return [] // último recurso
}
