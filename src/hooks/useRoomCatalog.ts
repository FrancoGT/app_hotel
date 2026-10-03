"use client"

import { useCallback, useEffect, useState } from "react"
import { PUBLISH_ROOM_PHOTOS } from "@/config/hotel"
import { roomService } from "@/lib/services/roomService"
import { roomTypeService } from "@/lib/services/roomTypeService"
import { withTypeNames, type CatalogRoom } from "@/lib/utils/roomContent"

function toFriendlyError(err: unknown): string {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase()
  if (["cors", "network", "failed to fetch"].some((s) => message.includes(s))) {
    return "No pudimos conectarnos al servidor."
  }
  return "No pudimos cargar las habitaciones en este momento."
}

// Habitaciones públicas con el nombre de su tipo
export function useRoomCatalog() {
  const [rooms, setRooms] = useState<CatalogRoom[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [roomList, roomTypes] = await Promise.all([
        PUBLISH_ROOM_PHOTOS ? roomService.listWithMainImage() : roomService.list(),
        // Sin tipos se muestran igual las habitaciones, con título genérico
        roomTypeService.list().catch(() => []),
      ])
      setRooms(withTypeNames(roomList, roomTypes))
    } catch (err) {
      console.error("Error cargando habitaciones:", err)
      setError(toFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { rooms, loading, error, reload: load }
}
