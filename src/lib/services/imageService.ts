import { apiFetch, toArray } from "@/lib/http"
import type { Image, ImagePayload } from "@/lib/types/image"

export const imageService = {
  listByEntity: async (entityType: string, entityId: number): Promise<Image[]> =>
    toArray<Image>(await apiFetch(`/images/entity/${entityType}/${entityId}`)),

  getById: (id: number) => apiFetch<Image>(`/images/${id}`),

  create: (data: ImagePayload) =>
    apiFetch<Image>("/images", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<ImagePayload>) =>
    apiFetch<Image>(`/images/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/images/${id}`, { method: "DELETE" }),

  setAsMain: (id: number) => apiFetch<Image>(`/images/${id}/set-main`, { method: "PATCH" }),

  reorder: (entityType: string, entityId: number, imageIds: number[]) =>
    apiFetch<Image[]>("/images/reorder", {
      method: "POST",
      body: JSON.stringify({ entity_type: entityType, entity_id: entityId, image_ids: imageIds }),
    }),

  // URL de la imagen principal de una entidad (o la primera si ninguna está marcada)
  getMainUrl: async (entityType: string, entityId: number): Promise<string | undefined> => {
    const images = await imageService.listByEntity(entityType, entityId)
    return (images.find((img) => img.is_main) ?? images[0])?.url
  },
}
