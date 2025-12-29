import { API_BASE_URL } from "../api"
import { handleResponse } from "../client"
import { UserRegistrationData, UserOption } from "../types/user" // Agregamos UserOption
import { ApiResponse } from "../types/reservation"

// Helper local para auth (necesario para listar usuarios protegidos)
async function getAuthToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

// 1. TU FUNCIÓN DE REGISTRO (Pública)
export async function registerUser(userData: UserRegistrationData): Promise<ApiResponse<{ id: number }>> {
  const { password, ...rest } = userData
  const payload = { ...rest, pass: password }

  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

// 2. FUNCIÓN DE LISTADO (Protegida - Necesaria para ReservationForm)
export async function listUsers(): Promise<UserOption[]> {
  const token = await getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  try {
    const response = await fetch(`${API_BASE_URL}/users/`, {
      headers,
      cache: "no-store"
    })

    if (!response.ok) return []

    const data = await response.json()
    
    // Normalización de respuesta
    if (Array.isArray(data)) return data
    if (data && Array.isArray((data as any).data)) return (data as any).data
    
    return []
  } catch (error) {
    console.error("Error listando usuarios:", error)
    return []
  }
}

// 3. OBJETO DE COMPATIBILIDAD
// Esto permite que 'ReservationForm' siga funcionando con "userService.list()"
export const userService = {
  list: listUsers,
  create: registerUser
}