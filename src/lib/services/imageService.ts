import type { Image, ImagePayload } from "../types/image"
import { API_BASE_URL } from "@/lib/api"

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
    "Accept": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const url = `${API_BASE_URL}${path}`

  if (options.method !== "GET" && options.method !== undefined) {
    console.log(`[imageService] ${options.method} request body:`, options.body)
  }

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    console.error("[imageService] error response:", res.status, text)
    throw new Error(`${res.status} ${res.statusText} - ${text}`)
  }

  if (res.status === 204) {
    return undefined as unknown as T
  }

  return res.json() as Promise<T>
}

export const imageService = {
  // Obtener todas las imágenes de una entidad específica
  listByEntity: async (entityType: string, entityId: number): Promise<Image[]> => {
  const payload = await fetchWithAuth<any>(`/images/entity/${entityType}/${entityId}`)
    
    if (Array.isArray(payload)) return payload
    if (payload && Array.isArray(payload.data)) return payload.data
    if (payload && Array.isArray(payload.items)) return payload.items
    
    console.warn("[imageService] La respuesta no es un array válido", payload)
    return []
  },

  // Obtener una imagen por ID
  getById: (id: number): Promise<Image> =>
    fetchWithAuth<Image>(`/images/${id}`),

  // Crear una nueva imagen
  create: (data: ImagePayload): Promise<Image> =>
    fetchWithAuth<Image>("/images", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Actualizar una imagen existente
  update: (id: number, data: Partial<ImagePayload>): Promise<Image> =>
    fetchWithAuth<Image>(`/images/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Eliminar una imagen
  delete: (id: number): Promise<void> =>
    fetchWithAuth<undefined>(`/images/${id}`, {
      method: "DELETE",
    }),

  // Marcar una imagen como principal (útil para cualquier entidad)
  setAsMain: (id: number): Promise<Image> =>
    fetchWithAuth<Image>(`/images/${id}/set-main`, {
      method: "PATCH",
    }),

  // Reordenar imágenes (útil para galerías)
  reorder: (entityType: string, entityId: number, imageIds: number[]): Promise<Image[]> =>
    fetchWithAuth<Image[]>("/images/reorder", {
      method: "POST",
      body: JSON.stringify({
        entity_type: entityType,
        entity_id: entityId,
        image_ids: imageIds
      }),
    }),
}

// Exportaciones de compatibilidad
export const fetchImagesByEntity = imageService.listByEntity
export const fetchImageById = imageService.getById
export const createImage = imageService.create
export const updateImage = imageService.update
export const deleteImage = imageService.delete
export const setImageAsMain = imageService.setAsMain
export const reorderImages = imageService.reorder