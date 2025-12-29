"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { fetchRooms, createReservation } from "@/lib/fetcher"
import { useAuth } from "@/context/AuthContext"
import { parseServerError } from "@/lib/error-parser"

// 👇 1. IMPORTAMOS LA CONSTANTE
import { ROOM_STATUS_MAP } from "@/lib/constants/room"

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

  // 👇 2. HELPER ACTUALIZADO (Usa la constante importada)
  const renderStatusBadge = (status: string) => {
    const normalizedStatus = status.toLowerCase()
    
    // Buscamos en el mapa importado, si no existe, usamos un default gris
    const config = ROOM_STATUS_MAP[normalizedStatus] || { 
      label: status, 
      className: "bg-gray-100 text-gray-700 border-gray-200" 
    }
  
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getRooms = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchRooms()
      setRooms(data)
    } catch (err) {
      console.error("Error fetching rooms:", err)
      const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase()

      if (
        errorMessage.includes("cors") ||
        errorMessage.includes("network") ||
        errorMessage.includes("failed to fetch")
      ) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
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

  const calculateTotalAmount = (pricePerNight: number, checkIn: string, checkOut: string): number => {
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return pricePerNight * Math.max(diffDays, 1)
  }

  const getTotalDays = (checkIn: string, checkOut: string): number => {
    if (!checkIn || !checkOut) return 1
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const diffTime = checkOutDate.getTime() - checkInDate.getTime()
    return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")
    if (!token || !user || !selectedRoom) return

    setFieldErrors({})
    setGeneralError(null)

    const totalAmount = calculateTotalAmount(selectedRoom.pricePerNight, formData.checkInDate, formData.checkOutDate)

    try {
      const response = await createReservation(token, {
        roomId: selectedRoom.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        adults: Number(formData.adults),
        children: Number(formData.children),
        specialRequests: formData.specialRequests,
        totalAmount: totalAmount,
        aiNotes: "", 
      })

      const aiMessage = response.aiNotes 
        ? ` 🤖 ${response.aiNotes}` 
        : "";

      showNotification(
        "success",
        `¡Excelente! Tu reserva para la habitación ${selectedRoom.roomNumber} ha sido confirmada exitosamente.${aiMessage}`
      )

      setSelectedRoom(null)
      setFormData({
        checkInDate: "",
        checkOutDate: "",
        adults: 1,
        children: 0,
        specialRequests: "",
      })
    } catch (err) {
      console.error(err)
      const parsedError = parseServerError(err)

      setFieldErrors(parsedError.fieldErrors || {})
      setGeneralError(parsedError.generalError || null)

      if (parsedError.generalError) {
        showNotification("error", parsedError.generalError)
      } else if (parsedError.fieldErrors && Object.keys(parsedError.fieldErrors).length > 0) {
        showNotification("error", "Por favor, corrige los errores en el formulario.")
      } else {
        showNotification(
          "error",
          "Lo sentimos, hubo un problema al procesar tu reserva. Por favor, inténtalo nuevamente.",
        )
      }
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--illary-primary)]"></div>
          <p className="mt-4 text-gray-600 font-medium">Cargando habitaciones...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Servicio no disponible</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={getRooms}
            className="bg-[var(--illary-primary)] hover:bg-[var(--illary-primary-dark)] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg inline-flex items-center gap-2"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-4 relative max-w-6xl">
      {/* Notification */}
      {notification.show && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] w-full max-w-md mx-4 transition-all duration-500 ease-in-out ${
            notification.show ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        >
          <div
            className={`${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            } border-2 p-4 rounded-xl shadow-lg backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    notification.type === "success" ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  {notification.type === "success" ? "✓" : "✕"}
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    {notification.type === "success" ? "¡Reserva Confirmada!" : "Error en la Reserva"}
                  </p>
                  <p className="text-sm opacity-90">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => setNotification((prev) => ({ ...prev, show: false }))}
                className="text-gray-500 hover:text-gray-700 ml-4"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Welcome Banner */}
      {showMessageBanner && (
        <div
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[55] w-full max-w-md mx-4 transition-all duration-500 ease-in-out ${
            showMessageBanner ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
          }`}
        >
          {isLoggedIn && user ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl shadow-lg backdrop-blur-sm text-center">
              <p className="text-lg font-medium">
                ¡Bienvenido(a), <span className="font-bold">{user.name}</span>!
              </p>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl shadow-lg backdrop-blur-sm text-center">
              <p>
                ¡Hola! Para solicitar alguna reserva debes <strong>iniciar sesión</strong> o{" "}
                <strong>registrarte</strong>.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="text-center mb-6 mt-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight mb-1 leading-tight">
          Nuestras Habitaciones
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
        {rooms.map((room) => (
          <div key={room.id} className="card relative">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-bold text-gray-800">Habitación {room.roomNumber}</h2>
                {/* Usamos el Helper que llama al Diccionario importado */}
                {renderStatusBadge(room.status)}
            </div>

            <p className="text-sm text-[var(--illary-text-light)] mb-2 leading-relaxed">{room.description}</p>
            <p className="text-sm text-gray-600">Piso: {room.floor}</p>
            <p className="text-sm text-gray-600">Ocupación máxima: {room.maxOccupancy} personas</p>
            
            <p className="price text-2xl font-bold text-[var(--illary-primary)] my-3">
              S/ {room.pricePerNight} <span className="text-sm font-normal text-gray-500">por noche</span>
            </p>
            
            <ul className="mt-3 list-disc list-inside text-sm text-[var(--illary-text-light)] space-y-1">
              {room.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            
            {/* Botón condicional según estado */}
            {isLoggedIn ? (
              <button 
                className={`mt-4 w-full py-2 px-4 rounded transition-colors ${
                    room.status.toLowerCase() === 'available' 
                    ? 'btn-illary' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => room.status.toLowerCase() === 'available' && handleReserve(room)}
                disabled={room.status.toLowerCase() !== 'available'}
              >
                {room.status.toLowerCase() === 'available' ? 'Reservar' : 'No Disponible'}
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 p-6 relative">
              <button
                type="button"
                onClick={() => setSelectedRoom(null)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Reservar Habitación</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-semibold text-blue-600">Habitación {selectedRoom.roomNumber}</h4>
                    {renderStatusBadge(selectedRoom.status)}
                </div>
                
                <p className="text-gray-600 text-sm mb-2">{selectedRoom.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <p><span className="font-medium">Piso:</span> {selectedRoom.floor}</p>
                  <p><span className="font-medium">Capacidad:</span> {selectedRoom.maxOccupancy} personas</p>
                  <p><span className="font-medium">Precio:</span> <span className="text-green-600 font-bold">S/ {selectedRoom.pricePerNight}</span></p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {generalError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                  <strong className="font-bold">¡Error!</strong> <span className="block sm:inline"> {generalError}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha de entrada</label>
                  <input
                    type="date"
                    id="checkInDate"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleInputChange}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.checkInDate ? "border-red-500" : "border-gray-300"}`}
                    required
                  />
                  {fieldErrors.checkInDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.checkInDate}</p>}
                </div>
                <div>
                  <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-2">Fecha de salida</label>
                  <input
                    type="date"
                    id="checkOutDate"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleInputChange}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.checkOutDate ? "border-red-500" : "border-gray-300"}`}
                    required
                  />
                  {fieldErrors.checkOutDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.checkOutDate}</p>}
                </div>
                <div>
                  <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-2">Adultos</label>
                  <input
                    type="number"
                    id="adults"
                    name="adults"
                    min={1}
                    max={selectedRoom.maxOccupancy}
                    value={formData.adults}
                    onChange={handleInputChange}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.adults ? "border-red-500" : "border-gray-300"}`}
                    required
                  />
                  {fieldErrors.adults && <p className="text-red-500 text-xs mt-1">{fieldErrors.adults}</p>}
                </div>
                <div>
                  <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-2">Niños</label>
                  <input
                    type="number"
                    id="children"
                    name="children"
                    min={0}
                    value={formData.children}
                    onChange={handleInputChange}
                    className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.children ? "border-red-500" : "border-gray-300"}`}
                  />
                  {fieldErrors.children && <p className="text-red-500 text-xs mt-1">{fieldErrors.children}</p>}
                </div>
              </div>

              <div className="mb-6">
                <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">Solicitudes especiales</label>
                <textarea
                  id="specialRequests"
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Describe cualquier solicitud especial que tengas..."
                  rows={3}
                  className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${fieldErrors.specialRequests ? "border-red-500" : "border-gray-300"}`}
                />
              </div>

              {formData.checkInDate && formData.checkOutDate && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Resumen de la reserva</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex justify-between">
                      <span>Precio por noche:</span>
                      <span>S/ {selectedRoom.pricePerNight}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Número de noches:</span>
                      <span>{getTotalDays(formData.checkInDate, formData.checkOutDate)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg text-green-600">
                        <span>Total:</span>
                        <span>S/ {calculateTotalAmount(selectedRoom.pricePerNight, formData.checkInDate, formData.checkOutDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 btn-illary">
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}