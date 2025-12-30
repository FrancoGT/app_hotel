"use client"

import { useState, useEffect } from "react"
import RoomCard from "./roomPartials/RoomCard"
import ReservationModal from "./roomPartials/ReservationModal"
import Notification from "./roomPartials/Notification"
import WelcomeBanner from "./roomPartials/WelcomeBanner"
import LoadingIndicator from "./roomPartials/LoadingIndicator"
import ErrorDisplay from "./ErrorDisplay"
import { useAuth } from "@/context/AuthContext"
import { fetchRooms } from "@/lib/fetcher"
import { getStatusConfig } from "@/lib/utils/roomUtils"

type Room = {
  id: number
  roomNumber: string
  floor: number
  status: string
  maxOccupancy: number
  pricePerNight: number
  description: string
  features: string[]
}

type NotificationState = {
  show: boolean
  type: "success" | "error"
  message: string
}

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    type: "success",
    message: "",
  })
  const [showMessageBanner, setShowMessageBanner] = useState(true)
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    children: 0,
    specialRequests: "",
  })
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)

  const { user, isLoggedIn } = useAuth()

  const getRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRooms()
      setRooms(data)
    } catch (err) {
      console.error("Error fetching rooms:", err)
      const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()

      if (errorMessage.includes("cors") || errorMessage.includes("network") || errorMessage.includes("failed to fetch")) {
        setError("No pudimos conectarnos al servidor.")
      } else if (errorMessage.includes("500") || errorMessage.includes("internal server")) {
        setError("Lo sentimos, el servicio no se encuentra disponible en este momento.")
      } else if (errorMessage.includes("timeout")) {
        setError("La solicitud ha tardado demasiado. Por favor, inténtalo nuevamente.")
      } else {
        setError("Lo sentimos, el servicio no se encuentra disponible en este momento.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getRooms()
  }, [])

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification((prev) => ({ ...prev, show: false }))
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  useEffect(() => {
    if (showMessageBanner) {
      const timer = setTimeout(() => {
        setShowMessageBanner(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showMessageBanner])

  useEffect(() => {
    if (selectedRoom) {
      setFieldErrors({})
      setGeneralError(null)
    }
  }, [selectedRoom])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({
      show: true,
      type,
      message,
    })
  }

  const handleInputChange = (name: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
    
    if ((name === "checkInDate" || name === "checkOutDate") && generalError?.includes("fecha de Check-Out")) {
      setGeneralError(null)
    }
  }

  const handleReserve = (room: Room) => {
    setSelectedRoom(room)
  }

  const handleCloseModal = () => {
    setSelectedRoom(null)
  }

  if (loading) return <LoadingIndicator />
  if (error) return <ErrorDisplay error={error} onRetry={getRooms} />

  return (
    <div className="container mx-auto px-4 py-4 relative max-w-6xl">
      <Notification
        notification={notification}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
      
      <WelcomeBanner
        show={showMessageBanner}
        isLoggedIn={isLoggedIn}
        user={user}
      />

      <div className="text-center mb-6 mt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-1 leading-tight">
          Nuestras Habitaciones
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            isLoggedIn={isLoggedIn}
            onReserve={handleReserve}
            getStatusConfig={getStatusConfig}
          />
        ))}
      </div>

      {selectedRoom && (
        <ReservationModal
          room={selectedRoom}
          formData={formData}
          fieldErrors={fieldErrors}
          generalError={generalError}
          onClose={handleCloseModal}
          onInputChange={handleInputChange}
          showNotification={showNotification}
          setFormData={setFormData}
          setFieldErrors={setFieldErrors}
          setGeneralError={setGeneralError}
          user={user}
          getStatusConfig={getStatusConfig}
        />
      )}
    </div>
  )
}