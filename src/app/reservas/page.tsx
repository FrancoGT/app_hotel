"use client"

import { useState, useEffect } from "react"
import { fetchAllReservations } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"

interface Reservation {
  id: number
  roomId: number
  userId: number
  status: string
  paymentStatus: string
  checkInDate: string
  checkOutDate: string
  totalAmount: string | number
  specialRequests?: string
  aiNotes?: string
  createdAt: string
  updatedAt: string
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true)
        const data = await fetchAllReservations()
        setReservations(data)
      } catch (err: any) {
        setError(err.message || "Error al cargar las reservas")
      } finally {
        setLoading(false)
      }
    }

    if (hasMounted) {
      loadReservations()
    }
  }, [hasMounted])

  const calculateStayDuration = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diff = end.getTime() - start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  const formatDateRange = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    const end = new Date(checkOut).toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    return `${start} - ${end}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-100"
      case "pending":
        return "text-yellow-600 bg-yellow-100"
      case "cancelled":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  if (!hasMounted) return null

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-16 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#9F836A] mb-4">Cargando reservas...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#9F836A] mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-16 p-6">
        <div className="text-center">
          <h2 className="text-2xl font-serif text-[#9F836A] mb-4">Error</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[#9F836A] hover:bg-[#8A7158] text-white font-serif"
          >
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto mt-16 p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-serif text-[#9F836A] mb-2">Reservas realizadas</h2>
        <p className="text-gray-600">Total de reservas: {reservations.length}</p>
      </div>

      {reservations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay reservas disponibles</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reservations.map((reservation) => {
            const duration = calculateStayDuration(reservation.checkInDate, reservation.checkOutDate)
            const total = Number(reservation.totalAmount)
            return (
              <div
                key={reservation.id}
                className="border border-gray-300 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-serif text-[#9F836A] mb-1">Reserva #{reservation.id}</h3>
                    <p className="text-sm text-gray-600">Número de Habitación: {reservation.roomId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                    {getStatusText(reservation.status)}
                  </span>
                </div>

                <div className="bg-[#9F836A]/10 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#9F836A]">Fechas de estadía</span>
                    <span className="text-sm text-gray-600">
                      {duration} noche{duration > 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="text-[#9F836A] font-medium">
                    {formatDateRange(reservation.checkInDate, reservation.checkOutDate)}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                    <div>
                      <span className="text-gray-600">Check-in:</span>
                      <p className="font-medium">{formatDate(reservation.checkInDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Check-out:</span>
                      <p className="font-medium">{formatDate(reservation.checkOutDate)}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-700">
                    <span className="font-medium">Total estimado:</span> S/. {total.toFixed(2)}
                  </p>
                  {reservation.specialRequests && (
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Solicitudes especiales:</span> {reservation.specialRequests}
                    </p>
                  )}
                  {reservation.aiNotes && (
                    <p className="text-gray-700 text-sm">
                      <span className="font-medium">Notas adicionales:</span> {reservation.aiNotes}
                    </p>
                  )}
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <p>Reserva creada: {formatDate(reservation.createdAt)}</p>
                  {reservation.updatedAt !== reservation.createdAt && (
                    <p>Actualizada: {formatDate(reservation.updatedAt)}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}