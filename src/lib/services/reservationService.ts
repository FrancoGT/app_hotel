import type { 
  Reservation, 
  ReservationAdmin, 
  ReservationPayload, 
  ReservationUpdatePayload 
} from "../types/reservation"

import { API_BASE_URL } from "../api"

// 1. Helpers de Autenticación
async function getAuthToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

// 2. Función Fetch Genérica con Auth
async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {},
  explicitToken?: string
): Promise<T> {
  // Prioridad: Token explícito > Token en localStorage
  const token = explicitToken || await getAuthToken()
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const url = `${API_BASE_URL}${path}`

  // Debug: Ver qué estamos enviando realmente
  if (options.method === "POST") {
     // console.log(`[reservationService] Enviando a ${url}:`, options.body)
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error(`[reservationService] Error ${res.status}:`, text)
    // Lanzamos error con el mensaje del backend para que el frontend lo muestre
    throw new Error(text || `Error ${res.status}`)
  }

  if (res.status === 204) {
    return undefined as unknown as T
  }

  return res.json() as Promise<T>
}

// 3. El Servicio Exportado
export const reservationService = {
  
  listAll: async (): Promise<ReservationAdmin[]> => {
    const payload = await fetchWithAuth<ReservationAdmin[]>("/reservations/all")
    if (Array.isArray(payload)) return payload
    return []
  },

  listMy: async (token?: string): Promise<Reservation[]> => {
    const payload = await fetchWithAuth<Reservation[]>("/reservations/my", {}, token)
    if (Array.isArray(payload)) return payload
    return []
  },

  getById: (id: number, token?: string): Promise<Reservation> =>
    fetchWithAuth<Reservation>(`/reservations/${id}`, {}, token),

  // IMPORTANTE: Aquí 'data' va PRIMERO, 'token' va SEGUNDO (opcional)
  create: (data: ReservationPayload, token?: string): Promise<Reservation> =>
    fetchWithAuth<Reservation>("/reservations/", {
      method: "POST",
      body: JSON.stringify(data),
    }, token),

  update: (id: number, data: ReservationUpdatePayload, token?: string): Promise<Reservation> =>
    fetchWithAuth<Reservation>(`/reservations/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }, token),

  delete: (id: number, token?: string): Promise<void> =>
    fetchWithAuth<undefined>(`/reservations/${id}`, {
      method: "DELETE",
    }, token),
}

// =========================================================
// 4. ADAPTADOR CLAVE (Aquí estaba el problema)
// =========================================================

export const fetchMyReservations = reservationService.listMy

/**
 * Tu Frontend envía: createReservation(token, data)
 * El Servicio espera: reservationService.create(data, token)
 * * 👇 Este adaptador corrige el orden:
 */
export const createReservation = (token: string, data: ReservationPayload) => {
  // OJO AQUÍ: Pasamos 'data' primero, 'token' segundo
  return reservationService.create(data, token)
}