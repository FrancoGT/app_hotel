import type { Room, RoomPayload } from "../types/room"

// 1. Configuración de la URL Base
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "")

// 2. Helpers de Autenticación
async function getAuthToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

// 3. Función Fetch Genérica con Auth
async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const url = `${API_BASE_URL}${path}`

  if (options.method !== "GET" && options.method !== undefined) {
    console.log(`[roomService] ${options.method} request body:`, options.body)
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("[roomService] error response:", res.status, text)
    throw new Error(`${res.status} ${res.statusText} - ${text}`)
  }

  if (res.status === 204) {
    return undefined as unknown as T
  }

  return res.json() as Promise<T>
}

// 4. El Servicio Exportado (Objeto principal)
export const roomService = {
  // GET: Obtener todas las habitaciones
  list: async (): Promise<Room[]> => {
    const payload = await fetchWithAuth<any>("/rooms")
    
    // Normalización de respuesta
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.data)) return payload.data
    if (payload && Array.isArray(payload.items)) return payload.items
    
    console.warn("[roomService] La respuesta no es un array válido", payload)
    return [] 
  },

  getById: (id: number): Promise<Room> =>
    fetchWithAuth<Room>(`/rooms/${id}`),

  create: (data: RoomPayload): Promise<Room> =>
    fetchWithAuth<Room>("/rooms", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: number, data: RoomPayload): Promise<Room> =>
    fetchWithAuth<Room>(`/rooms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: number): Promise<void> =>
    fetchWithAuth<undefined>(`/rooms/${id}`, {
      method: "DELETE",
    }),
}

// 5. EXPORTACIONES DE COMPATIBILIDAD (Esto soluciona tu error)
// Esto permite que "import { fetchRooms } from ..." funcione correctamente
export const fetchRooms = roomService.list;