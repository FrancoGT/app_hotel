import { apiFetch, toArray, withNumbers } from "@/lib/http"
import type { RoomType, RoomTypePayload } from "@/lib/types/room_type"

const normalize = (rt: RoomType): RoomType => withNumbers(rt, ["basePrice"])

export const roomTypeService = {
  list: async (): Promise<RoomType[]> => toArray<RoomType>(await apiFetch("/room-types/")).map(normalize),

  getById: async (id: number) => normalize(await apiFetch<RoomType>(`/room-types/${id}`)),

  create: async (data: RoomTypePayload) =>
    normalize(await apiFetch<RoomType>("/room-types/", { method: "POST", body: JSON.stringify(data) })),

  update: async (id: number, data: Partial<RoomTypePayload>) =>
    normalize(await apiFetch<RoomType>(`/room-types/${id}`, { method: "PUT", body: JSON.stringify(data) })),

  delete: (id: number) => apiFetch<void>(`/room-types/${id}`, { method: "DELETE" }),
}
