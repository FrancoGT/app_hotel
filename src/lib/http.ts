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
    throw new ApiError(res.status, errorMessage(detail, text, res.status), detail)
  }

  if (res.status === 204) return undefined as T

  const contentType = res.headers.get("content-type") ?? ""
  if (!contentType.includes("application/json")) return undefined as T

  return (await res.json()) as T
}

// Mensaje legible: el detail de texto, o los errores de validación 422 de FastAPI ("campo: motivo")
function errorMessage(detail: unknown, text: string, status: number): string {
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    const parts = detail
      .map((d: { loc?: unknown[]; msg?: string }) => (d?.msg ? `${d.loc?.[d.loc.length - 1] ?? ""}: ${d.msg}` : null))
      .filter(Boolean)
    if (parts.length) return parts.join(" · ")
  }
  return text || `HTTP ${status}`
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

// Los DECIMAL del backend llegan como string ("150.00"); convierte los campos indicados a number
export function withNumbers<T extends object>(item: T, keys: readonly (keyof T)[]): T {
  if (!item) return item
  const out = { ...item }
  for (const key of keys) {
    const value = out[key]
    if (typeof value === "string" && value.trim() !== "") out[key] = Number(value) as T[keyof T]
  }
  return out
}
