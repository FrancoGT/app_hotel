"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { fetchRooms, createReservation } from "@/lib/fetcher"
import { useAuth } from "@/context/AuthContext"

// Definición del tipo de habitación
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

export default function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [formData, setFormData] = useState({
    checkInDate: "",
    checkOutDate: "",
    adults: 1,
    children: 0,
    specialRequests: "",
  })
  const { user, isLoggedIn } = useAuth()

  useEffect(() => {
    const getRooms = async () => {
      try {
        const data = await fetchRooms()
        setRooms(data)
      } catch (err) {
        console.error("Error fetching rooms:", err)
      } finally {
        setLoading(false)
      }
    }
    getRooms()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
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

    const totalAmount = calculateTotalAmount(selectedRoom.pricePerNight, formData.checkInDate, formData.checkOutDate)

    try {
      await createReservation(token, {
        roomId: selectedRoom.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        adults: Number(formData.adults),
        children: Number(formData.children),
        specialRequests: formData.specialRequests,
        totalAmount: totalAmount,
        aiNotes: "Solicitud generada desde la plataforma",
      })
      alert("Reserva creada exitosamente")
      setSelectedRoom(null)
    } catch (err) {
      console.error(err)
      alert("Error al crear la reserva")
    }
  }

  if (loading) return <p className="text-center text-gray-500">Cargando...</p>

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {isLoggedIn && user ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-md mb-6 shadow-sm text-center">
          <p className="text-lg font-medium">
            ¡Bienvenido(a), <span className="font-bold">{user.name}</span>!
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md mb-6 shadow-sm text-center">
          <p>
            ¡Hola! Para solicitar alguna reserva debes <strong>iniciar sesión</strong> o <strong>registrarte</strong>.
          </p>
        </div>
      )}

      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Nuestras Habitaciones Exclusivas
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Descubre el confort y la elegancia en cada rincón. Encuentra la habitación perfecta para tu estancia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
        {rooms.map((room) => (
          <div
            key={room.id}
            className="rounded-2xl shadow-md border border-gray-200 p-6 bg-white hover:shadow-lg transition"
          >
            <h2 className="text-xl font-semibold text-blue-600 mb-1">Habitación {room.roomNumber}</h2>
            <p className="text-gray-500 text-sm mb-2">{room.description}</p>
            <p className="text-sm text-gray-700">Piso: {room.floor}</p>
            <p className="text-sm text-gray-700">Ocupación máxima: {room.maxOccupancy} personas</p>
            <p className="text-sm text-gray-700 mb-2">Estado: {room.status}</p>
            <p className="text-lg font-bold text-green-600">S/ {room.pricePerNight} por noche</p>
            <ul className="mt-4 list-disc list-inside text-sm text-gray-600">
              {room.features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
            {isLoggedIn ? (
              <button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                onClick={() => handleReserve(room)}
              >
                Reservar
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {selectedRoom && (
        <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
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
                <h4 className="text-lg font-semibold text-blue-600 mb-2">Habitación {selectedRoom.roomNumber}</h4>
                <p className="text-gray-600 text-sm mb-2">{selectedRoom.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Piso:</span> {selectedRoom.floor}
                  </p>
                  <p>
                    <span className="font-medium">Capacidad:</span> {selectedRoom.maxOccupancy} personas
                  </p>
                  <p>
                    <span className="font-medium">Precio:</span>{" "}
                    <span className="text-green-600 font-bold">S/ {selectedRoom.pricePerNight}</span> por noche
                  </p>
                  <p>
                    <span className="font-medium">Estado:</span> {selectedRoom.status}
                  </p>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de entrada</label>
                  <input
                    type="date"
                    name="checkInDate"
                    value={formData.checkInDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de salida</label>
                  <input
                    type="date"
                    name="checkOutDate"
                    value={formData.checkOutDate}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adultos</label>
                  <input
                    type="number"
                    name="adults"
                    min={1}
                    max={selectedRoom.maxOccupancy}
                    value={formData.adults}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Niños</label>
                  <input
                    type="number"
                    name="children"
                    min={0}
                    value={formData.children}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Solicitudes especiales</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Describe cualquier solicitud especial que tengas..."
                  rows={3}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Resumen de precio */}
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
                    <div className="flex justify-between">
                      <span>Huéspedes:</span>
                      <span>
                        {formData.adults} adultos{formData.children > 0 && `, ${formData.children} niños`}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between font-bold text-lg text-green-600">
                        <span>Total:</span>
                        <span>
                          S/{" "}
                          {calculateTotalAmount(
                            selectedRoom.pricePerNight,
                            formData.checkInDate,
                            formData.checkOutDate,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedRoom(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
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