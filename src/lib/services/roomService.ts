import { apiFetch, toArray, withNumbers } from "@/lib/http"
import { imageService } from "./imageService"
import type { Room, RoomPayload } from "@/lib/types/room"

const normalize = (room: Room): Room => withNumbers(room, ["pricePerNight"])

export const roomService = {
  list: async (): Promise<Room[]> => toArray<Room>(await apiFetch("/rooms")).map(normalize),

  // Habitaciones con su imagen principal; si falla la imagen, la habitación se muestra sin ella
  listWithMainImage: async (): Promise<Room[]> => {
    const rooms = await roomService.list()
    return Promise.all(
      rooms.map(async (room) => {
        try {
          return { ...room, mainImage: await imageService.getMainUrl("room", room.id) }
        } catch {
          return room
        }
      })
    )
  },

  getById: async (id: number) => normalize(await apiFetch<Room>(`/rooms/${id}`)),

  create: async (data: RoomPayload) =>
    normalize(await apiFetch<Room>("/rooms", { method: "POST", body: JSON.stringify(data) })),

  update: async (id: number, data: RoomPayload) =>
    normalize(await apiFetch<Room>(`/rooms/${id}`, { method: "PUT", body: JSON.stringify(data) })),

  delete: (id: number) => apiFetch<void>(`/rooms/${id}`, { method: "DELETE" }),
}
