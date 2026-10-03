"use client"

import { RoomCard } from "./RoomCard"
import { LoadingIndicator } from "@/components/common/LoadingIndicator"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"
import { useRoomCatalog } from "@/hooks/useRoomCatalog"
import { HOTEL } from "@/config/hotel"

export function RoomList() {
  const { rooms, loading, error, reload } = useRoomCatalog()

  if (loading) return <LoadingIndicator message="Cargando habitaciones..." />
  if (error) return <ErrorDisplay error={error} onRetry={reload} />

  if (rooms.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--illary-line)] p-8 text-center text-[var(--illary-text)]">
        Aún no hay habitaciones publicadas. Llámanos al{" "}
        <a href={HOTEL.phoneHref} className="font-semibold underline">
          {HOTEL.phoneDisplay}
        </a>{" "}
        para consultar opciones.
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rooms.map((room) => (
        <RoomCard key={room.id} room={room} />
      ))}
    </div>
  )
}
