// Estructura de respuesta estándar
export type ApiResponse<T> = {
  data?: T
  error?: { message: string; details?: any }
}

export async function handleResponse<T = any>(response: Response): Promise<ApiResponse<T>> {
  let payload: any = null

  // Intenta parsear JSON solo si corresponde
  try {
    const ct = response.headers.get("content-type") || ""
    payload = ct.includes("application/json") ? await response.json() : null
  } catch {
    // sin body JSON
  }

  // 204 No Content
  if (response.status === 204) return { data: undefined as unknown as T }

  // Error HTTP
  if (!response.ok) {
    const message =
      (payload && (payload.detail || payload.message)) ||
      `HTTP ${response.status}`
    return { error: { message, details: payload } }
  }

  // OK → retorna el body como data (tu backend ya devuelve el objeto directamente)
  return { data: (payload ?? null) as T }
}

// Asegura Authorization y Accept; no fuerces Content-Type en GETs
export function withAuth(headers: HeadersInit = {}, token?: string): HeadersInit {
  const h: Record<string, string> =
    headers instanceof Headers ? Object.fromEntries(headers.entries()) : { ...headers as Record<string, string> }

  if (token) h.Authorization = `Bearer ${token}`
  if (!h.Accept) h.Accept = "application/json"
  return h
}