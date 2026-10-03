"use client"

import type React from "react"
import { useState } from "react"
import { StatusBadge } from "@/components/ui/status-badge"
import { reservationService } from "@/lib/services/reservationService"
import { parseServerError } from "@/lib/error-parser"
import { ROOM_STATUS } from "@/lib/constants/status"
import { calculateTotalAmount, getNights } from "@/lib/utils/roomUtils"
import type { Room } from "@/lib/types/room"
import type { Reservation } from "@/lib/types/reservation"

interface BookingModalProps {
  room: Room
  onClose: () => void
  onBooked: (reservation: Reservation) => void
  onError: (message: string) => void
}

const INITIAL_FORM = {
  checkInDate: "",
  checkOutDate: "",
  adults: 1,
  children: 0,
  specialRequests: "",
}

// Reserva que hace el propio cliente: la habitación ya está elegida y el usuario lo pone el backend
export function BookingModal({ room, onClose, onBooked, onError }: BookingModalProps) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Mínimo una noche, como en el cálculo del backend
  const nights = Math.max(getNights(form.checkInDate, form.checkOutDate), 1)
  const totalAmount = calculateTotalAmount(room.pricePerNight, nights)

  const handleChange = (name: keyof typeof INITIAL_FORM, value: string | number) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
    if ((name === "checkInDate" || name === "checkOutDate") && generalError?.includes("fecha de Check-Out")) {
      setGeneralError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    setGeneralError(null)
    setSubmitting(true)

    try {
      const reservation = await reservationService.create({
        roomId: room.id,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        adults: Number(form.adults),
        children: Number(form.children),
        specialRequests: form.specialRequests,
        totalAmount,
        aiNotes: "",
      })
      onBooked(reservation)
    } catch (err) {
      console.error(err)
      const parsed = parseServerError(err)
      setFieldErrors(parsed.fieldErrors ?? {})
      setGeneralError(parsed.generalError ?? null)

      if (parsed.generalError) {
        onError(parsed.generalError)
      } else if (parsed.fieldErrors && Object.keys(parsed.fieldErrors).length > 0) {
        onError("Por favor, corrige los errores en el formulario.")
      } else {
        onError("Lo sentimos, hubo un problema al procesar tu reserva. Por favor, inténtalo nuevamente.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field: string) =>
    `w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
      fieldErrors[field] ? "border-red-500" : "border-gray-300"
    }`

  const fieldError = (field: string) =>
    fieldErrors[field] && <p className="text-red-500 text-xs mt-1">{fieldErrors[field]}</p>

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-6 relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Reservar Habitación</h3>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-blue-600">Habitación {room.roomNumber}</h4>
              <StatusBadge
                map={ROOM_STATUS}
                status={room.status}
                className="px-3 py-1 font-bold uppercase tracking-wider"
              />
            </div>
            <p className="text-gray-600 text-sm mb-2">{room.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <p>
                <span className="font-medium">Piso:</span> {room.floor}
              </p>
              <p>
                <span className="font-medium">Capacidad:</span> {room.maxOccupancy} personas
              </p>
              <p>
                <span className="font-medium">Precio:</span>{" "}
                <span className="text-green-600 font-bold">S/ {room.pricePerNight}</span>
              </p>
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
              <label htmlFor="checkInDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de entrada
              </label>
              <input
                type="date"
                id="checkInDate"
                value={form.checkInDate}
                onChange={(e) => handleChange("checkInDate", e.target.value)}
                className={inputClass("checkInDate")}
                required
              />
              {fieldError("checkInDate")}
            </div>
            <div>
              <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de salida
              </label>
              <input
                type="date"
                id="checkOutDate"
                value={form.checkOutDate}
                onChange={(e) => handleChange("checkOutDate", e.target.value)}
                className={inputClass("checkOutDate")}
                required
              />
              {fieldError("checkOutDate")}
            </div>
            <div>
              <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-2">
                Adultos
              </label>
              <input
                type="number"
                id="adults"
                min={1}
                max={room.maxOccupancy}
                value={form.adults}
                onChange={(e) => handleChange("adults", Number.parseInt(e.target.value))}
                className={inputClass("adults")}
                required
              />
              {fieldError("adults")}
            </div>
            <div>
              <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-2">
                Niños
              </label>
              <input
                type="number"
                id="children"
                min={0}
                value={form.children}
                onChange={(e) => handleChange("children", Number.parseInt(e.target.value))}
                className={inputClass("children")}
              />
              {fieldError("children")}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
              Solicitudes especiales
            </label>
            <textarea
              id="specialRequests"
              value={form.specialRequests}
              onChange={(e) => handleChange("specialRequests", e.target.value)}
              placeholder="Describe cualquier solicitud especial que tengas..."
              rows={3}
              className={inputClass("specialRequests")}
            />
            {fieldError("specialRequests")}
          </div>

          {form.checkInDate && form.checkOutDate && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Resumen de la reserva</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Precio por noche:</span>
                  <span>S/ {room.pricePerNight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Número de noches:</span>
                  <span>{nights}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg text-green-600">
                    <span>Total:</span>
                    <span>S/ {totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition"
            >
              Cancelar
            </button>
            <button type="submit" disabled={submitting} className="flex-1 btn-illary disabled:opacity-70">
              {submitting ? "Reservando..." : "Confirmar Reserva"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
