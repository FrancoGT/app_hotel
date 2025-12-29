// src/lib/auth.ts
import { API_BASE_URL } from "../api"
import { withAuth } from "../client"
import { LoginCredentials } from "../types/auth"

// User tal como lo maneja el FRONT (user + roles)
export interface CurrentUser {
  id: number
  login: string
  displayName: string
  first_name: string
  last_name: string
  admin: boolean
  employee: boolean
  status: string
  roles: string[] // 👈 aquí metemos el array ["Administradores"]
}

// User crudo que viene dentro de "user"
interface ApiUserBody {
  id: number
  login: string
  displayName: string
  first_name: string
  last_name: string
  admin: boolean
  employee: boolean
  status: string
}

// Respuesta cruda del login
interface LoginApiResponse {
  access_token: string
  token_type: string
  user: ApiUserBody
  roles?: string[]
}

export interface LoginSuccess {
  access_token: string
  token_type: string
  user: CurrentUser
}

// ======================= LOGIN =======================

export async function loginUser(credentials: LoginCredentials): Promise<LoginSuccess> {
  const res = await fetch(`${API_BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(credentials),
    cache: "no-store",
  })

  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    const msg = (payload && (payload.detail || payload.message)) || `HTTP ${res.status}`
    throw new Error(msg)
  }

  const data = (await res.json()) as LoginApiResponse

  const roles = data.roles ?? []

  const currentUser: CurrentUser = {
    ...data.user,
    roles,
  }

  return {
    access_token: data.access_token,
    token_type: data.token_type,
    user: currentUser,
  }
}

export async function fetchCurrentUser(token: string): Promise<CurrentUser> {
  const res = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: withAuth({ Accept: "application/json" }, token),
    cache: "no-store",
  })

  // --- FIX: DETECTAR TOKEN VENCIDO (401) ---
  if (res.status === 401) {
    // Si estamos en el navegador (cliente), redirigimos forzosamente
    if (typeof window !== "undefined") {
      window.location.href = "/" // Redirige al home (o a /login si prefieres)
    }
    // Lanzamos un error específico o retornamos null para detener la ejecución actual
    throw new Error("SESSION_EXPIRED")
  }
  // -----------------------------------------

  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    const msg = (payload && (payload.detail || payload.message)) || `HTTP ${res.status}`
    throw new Error(msg)
  }

  const data = await res.json()

  // ... resto del código de mapeo de datos
  if (data && typeof data === "object" && "user" in data) {
    const body = data as { user: ApiUserBody; roles?: string[] }
    return {
      ...body.user,
      roles: body.roles ?? [],
    }
  }

  const flat = data as ApiUserBody & { roles?: string[] }
  return {
    ...flat,
    roles: flat.roles ?? [],
  }
}

// ======================= LOGOUT =======================

export async function logoutUser(token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/users/logout`, {
    method: "POST",
    headers: withAuth({ "Content-Type": "application/json", Accept: "application/json" }, token),
    cache: "no-store",
  })
  if (!res.ok) {
    const payload = await res.json().catch(() => null)
    const msg = (payload && (payload.detail || payload.message)) || `HTTP ${res.status}`
    throw new Error(msg)
  }
}
