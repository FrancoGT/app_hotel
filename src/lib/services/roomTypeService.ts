import { API_BASE_URL } from "@/lib/api" // Tu configuración actual
// Importamos las interfaces que definimos en el paso anterior
import { RoomType, RoomTypePayload } from "../types/room_type"

// --- CORRECCIÓN: Re-exportamos los tipos para que RoomForm los encuentre ---
export type { RoomType, RoomTypePayload };

/**
 * Función helper mejorada para manejar métodos HTTP y Body
 */
async function fetchWithAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers, // Permite sobrescribir headers si fuera necesario
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options, // Pasa método (POST, PUT, etc.) y body
    headers,
  })

  if (!res.ok) {
    // Intentamos leer el mensaje de error del backend, si existe
    const errorBody = await res.json().catch(() => null)
    throw new Error(errorBody?.detail || "Error fetching data")
  }

  // Manejo especial para status 204 (No Content), común en DELETE
  if (res.status === 204) {
    return {} as T
  }

  return res.json()
}

export const roomTypeService = {
  // 1. Obtener todos (Público)
  list: (): Promise<RoomType[]> => {
    return fetchWithAuth<RoomType[]>("/room-types/")
  },

  // 2. Obtener uno por ID (Público)
  getById: (id: number): Promise<RoomType> => {
    return fetchWithAuth<RoomType>(`/room-types/${id}`)
  },

  // 3. Crear (Privado - Admin)
  create: (data: RoomTypePayload): Promise<RoomType> => {
    return fetchWithAuth<RoomType>("/room-types/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  // 4. Actualizar (Privado - Admin)
  // Usamos Partial<RoomTypePayload> por si no quieres enviar todos los campos
  update: (id: number, data: Partial<RoomTypePayload>): Promise<RoomType> => {
    return fetchWithAuth<RoomType>(`/room-types/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // 5. Eliminar (Privado - Admin)
  delete: (id: number): Promise<void> => {
    return fetchWithAuth<void>(`/room-types/${id}`, {
      method: "DELETE",
    })
  },
}