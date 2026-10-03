"use client"

import { useCallback, useEffect, useState } from "react"
import { RoomCard } from "./RoomCard"
import { BookingModal } from "./BookingModal"
import { WelcomeBanner } from "@/components/client/WelcomeBanner"
import { LoadingIndicator } from "@/components/common/LoadingIndicator"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"
import { Toast } from "@/components/ui/toast"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/useToast"
import { roomService } from "@/lib/services/roomService"
import type { Room } from "@/lib/types/room"
import type { Reservation } from "@/lib/types/reservation"

function toFriendlyError(err: unknown): string {
  const message = (err instanceof Error ? err.message : String(err)).toLowerCase()
  if (["cors", "network", "failed to fetch"].some((s) => message.includes(s))) {
    return "No pudimos conectarnos al servidor."
  }
  if (message.includes("timeout")) {
    return "La solicitud ha tardado demasiado. Por favor, inténtalo nuevamente."
  }
  return "Lo sentimos, el servicio no se encuentra disponible en este momento."
}

export function RoomList() {
  const { isLoggedIn } = useAuth()
  const { toast, showToast, hideToast } = useToast(8000)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)

  const loadRooms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRooms(await roomService.listWithMainImage())
    } catch (err) {
      console.error("Error fetching rooms:", err)
      setError(toFriendlyError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadRooms()
  }, [loadRooms])

  const handleBooked = (reservation: Reservation) => {
    const aiMessage = reservation.aiNotes ? ` 🤖 ${reservation.aiNotes}` : ""
    showToast(
      `¡Excelente! Tu reserva para la habitación ${selectedRoom?.roomNumber} ha sido confirmada exitosamente.${aiMessage}`,
      "success",
      "¡Reserva Confirmada!"
    )
    setSelectedRoom(null)
  }

  if (loading) return <LoadingIndicator message="Cargando habitaciones..." />
  if (error) return <ErrorDisplay error={error} onRetry={loadRooms} />

  return (
    <div className="container mx-auto px-4 py-4 relative max-w-6xl">
      <Toast toast={toast} onClose={hideToast} />
      <WelcomeBanner />

      <div className="text-center mb-6 mt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-1 leading-tight">
          Nuestras Habitaciones
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} canReserve={isLoggedIn} onReserve={setSelectedRoom} />
        ))}
      </div>

      {selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setSelectedRoom(null)}
          onBooked={handleBooked}
          onError={(message) => showToast(message, "error", "Error en la Reserva")}
        />
      )}
    </div>
  )
}
