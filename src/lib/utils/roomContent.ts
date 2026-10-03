// Qué datos de una habitación se muestran al visitante.
import { PUBLISH_ROOM_FEATURES } from "@/config/hotel"
import type { Room } from "@/lib/types/room"
import type { RoomType } from "@/lib/types/room_type"

export type CatalogRoom = Room & { typeName?: string }

// Afirmaciones incompatibles con el hotel o sin confirmar: el texto que las contenga no se publica
const UNVERIFIED_CLAIMS =
  /\bmar\b|oc[eé]ano|playa|panor[aá]mic|jacuzzi|minibar|aire acondicionado|desayuno|balc[oó]n|terraza|lujo/i

export function withTypeNames(rooms: Room[], roomTypes: RoomType[]): CatalogRoom[] {
  const names = new Map(roomTypes.map((t) => [t.id, t.name]))
  return rooms.map((room) => ({ ...room, typeName: names.get(room.roomTypeId) }))
}

export function roomTitle(room: CatalogRoom): string {
  return room.typeName?.trim() || "Habitación"
}

export function publicDescription(room: Room): string | undefined {
  const text = room.description?.trim()
  return text && !UNVERIFIED_CLAIMS.test(text) ? text : undefined
}

export function publicFeatures(room: Room): string[] {
  if (!PUBLISH_ROOM_FEATURES) return []
  return (room.features ?? []).filter((f) => !UNVERIFIED_CLAIMS.test(f))
}

export function capacityLabel(maxOccupancy: number): string {
  return maxOccupancy === 1 ? "1 persona" : `Hasta ${maxOccupancy} personas`
}
