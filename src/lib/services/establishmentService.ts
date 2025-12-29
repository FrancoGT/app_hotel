import type { Establishment, EstablishmentPayload } from "../types/establishment"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "")

async function getAuthToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("access_token")
}

async function fetchWithAuth<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken()
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const url = `${API_BASE_URL}${path}`
  
  // Log útil para depurar qué datos exactos se están enviando
  if (options.method !== "GET") {
    console.log(`[establishmentService] ${options.method} request body:`, options.body)
  }

  const res = await fetch(url, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("[establishmentService] error response:", res.status, text)
    throw new Error(`${res.status} ${res.statusText} - ${text}`)
  }

  if (res.status === 204) {
    return undefined as unknown as T
  }

  return res.json() as Promise<T>
}

export const establishmentService = {
  // GET
  list: (): Promise<Establishment[]> =>
    fetchWithAuth<Establishment[]>("/establishments?skip=0&limit=100"),

  // POST (Crear)
  create: (data: EstablishmentPayload): Promise<Establishment> =>
    fetchWithAuth<Establishment>("/establishments", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // PUT (Actualizar)
  update: (id: number, data: EstablishmentPayload): Promise<Establishment> =>
    fetchWithAuth<Establishment>(`/establishments/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // DELETE
  delete: (id: number): Promise<void> =>
    fetchWithAuth<undefined>(`/establishments/${id}`, {
      method: "DELETE",
    }),
}