import { apiFetch, toArray } from "@/lib/http"
import type { RoomType, RoomTypePayload } from "@/lib/types/room_type"

export const roomTypeService = {
  list: async (): Promise<RoomType[]> => toArray<RoomType>(await apiFetch("/room-types/")),

  getById: (id: number) => apiFetch<RoomType>(`/room-types/${id}`),

  create: (data: RoomTypePayload) =>
    apiFetch<RoomType>("/room-types/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<RoomTypePayload>) =>
    apiFetch<RoomType>(`/room-types/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/room-types/${id}`, { method: "DELETE" }),
}
