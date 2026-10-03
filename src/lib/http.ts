// Cliente HTTP único para toda la app: agrega el token, normaliza errores y respuestas vacías.
import { API_BASE_URL } from "./api"

export const TOKEN_KEY = "access_token"

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  // `detail` es lo que devuelve FastAPI; parseServerError() lo entiende directamente
  detail?: unknown

  constructor(status: number, message: string, detail?: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.detail = detail
  }
}

type ApiFetchOptions = RequestInit & {
  // Token explícito; si no se pasa se usa el guardado en localStorage
  token?: string | null
  // false para endpoints públicos que no deben llevar Authorization
  auth?: boolean
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token: explicitToken, auth = true, headers: extraHeaders, ...init } = options
  const token = auth ? explicitToken ?? getStoredToken() : null

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(init.body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders as Record<string, string> | undefined),
  }

  const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store", ...init, headers })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    let detail: unknown
    try {
      const body = JSON.parse(text)
      detail = body?.detail ?? body?.message
    } catch {
      // cuerpo no JSON
    }
    const message = typeof detail === "string" ? detail : text || `HTTP ${res.status}`
    throw new ApiError(res.status, message, detail)
  }

  if (res.status === 204) return undefined as T

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) return undefined as T

  return (await res.json()) as T
}

// Algunos endpoints devuelven el array directo y otros envuelto en { data } o { items }
export function toArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && typeof payload === "object") {
    const p = payload as { data?: unknown; items?: unknown }
    if (Array.isArray(p.data)) return p.data as T[]
    if (Array.isArray(p.items)) return p.items as T[]
  }
  return []
}
