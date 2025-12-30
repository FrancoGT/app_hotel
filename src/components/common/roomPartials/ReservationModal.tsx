import { createReservation } from "@/lib/fetcher"
import { parseServerError } from "@/lib/error-parser"
import { calculateTotalAmount, getTotalDays } from "@/lib/utils/roomUtils"

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

interface ReservationModalProps {
  room: Room
  formData: {
    checkInDate: string
    checkOutDate: string
    adults: number
    children: number
    specialRequests: string
  }
  fieldErrors: Record<string, string>
  generalError: string | null
  onClose: () => void
  onInputChange: (name: string, value: string | number) => void
  showNotification: (type: "success" | "error", message: string) => void
  setFormData: React.Dispatch<React.SetStateAction<{
    checkInDate: string
    checkOutDate: string
    adults: number
    children: number
    specialRequests: string
  }>>
  setFieldErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setGeneralError: React.Dispatch<React.SetStateAction<string | null>>
  user: any
  getStatusConfig: (status: string) => { label: string; className: string }
}

export default function ReservationModal({
  room,
  formData,
  fieldErrors,
  generalError,
  onClose,
  onInputChange,
  showNotification,
  setFormData,
  setFieldErrors,
  setGeneralError,
  user,
  getStatusConfig
}: ReservationModalProps) {

  const config = getStatusConfig(room.status)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem("access_token")
    if (!token || !user || !room) return

    setFieldErrors({})
    setGeneralError(null)

    const totalAmount = calculateTotalAmount(room.pricePerNight, formData.checkInDate, formData.checkOutDate)

    try {
      const response = await createReservation(token, {
        roomId: room.id,
        checkInDate: formData.checkInDate,
        checkOutDate: formData.checkOutDate,
        adults: Number(formData.adults),
        children: Number(formData.children),
        specialRequests: formData.specialRequests,
        totalAmount: totalAmount,
        aiNotes: "", 
      })

      const aiMessage = response.aiNotes ? ` 🤖 ${response.aiNotes}` : ""

      showNotification(
        "success",
        `¡Excelente! Tu reserva para la habitación ${room.roomNumber} ha sido confirmada exitosamente.${aiMessage}`
      )

      onClose()
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

  return (
    <div className="fixed inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="border-b border-gray-200 p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Reservar Habitación</h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-lg font-semibold text-blue-600">Habitación {room.roomNumber}</h4>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${config.className}`}>
                {config.label}
              </span>
            </div>
            
            <p className="text-gray-600 text-sm mb-2">{room.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
              <p><span className="font-medium">Piso:</span> {room.floor}</p>
              <p><span className="font-medium">Capacidad:</span> {room.maxOccupancy} personas</p>
              <p><span className="font-medium">Precio:</span> <span className="text-green-600 font-bold">S/ {room.pricePerNight}</span></p>
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
                name="checkInDate"
                value={formData.checkInDate}
                onChange={(e) => onInputChange("checkInDate", e.target.value)}
                className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.checkInDate ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {fieldErrors.checkInDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.checkInDate}</p>}
            </div>
            <div>
              <label htmlFor="checkOutDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de salida
              </label>
              <input
                type="date"
                id="checkOutDate"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={(e) => onInputChange("checkOutDate", e.target.value)}
                className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.checkOutDate ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {fieldErrors.checkOutDate && <p className="text-red-500 text-xs mt-1">{fieldErrors.checkOutDate}</p>}
            </div>
            <div>
              <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-2">
                Adultos
              </label>
              <input
                type="number"
                id="adults"
                name="adults"
                min={1}
                max={room.maxOccupancy}
                value={formData.adults}
                onChange={(e) => onInputChange("adults", parseInt(e.target.value))}
                className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.adults ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {fieldErrors.adults && <p className="text-red-500 text-xs mt-1">{fieldErrors.adults}</p>}
            </div>
            <div>
              <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-2">
                Niños
              </label>
              <input
                type="number"
                id="children"
                name="children"
                min={0}
                value={formData.children}
                onChange={(e) => onInputChange("children", parseInt(e.target.value))}
                className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  fieldErrors.children ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.children && <p className="text-red-500 text-xs mt-1">{fieldErrors.children}</p>}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-2">
              Solicitudes especiales
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={(e) => onInputChange("specialRequests", e.target.value)}
              placeholder="Describe cualquier solicitud especial que tengas..."
              rows={3}
              className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                fieldErrors.specialRequests ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.specialRequests && <p className="text-red-500 text-xs mt-1">{fieldErrors.specialRequests}</p>}
          </div>

          {formData.checkInDate && formData.checkOutDate && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Resumen de la reserva</h4>
              <div className="space-y-1 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span>Precio por noche:</span>
                  <span>S/ {room.pricePerNight}</span>
                </div>
                <div className="flex justify-between">
                  <span>Número de noches:</span>
                  <span>{getTotalDays(formData.checkInDate, formData.checkOutDate)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between font-bold text-lg text-green-600">
                    <span>Total:</span>
                    <span>S/ {calculateTotalAmount(room.pricePerNight, formData.checkInDate, formData.checkOutDate)}</span>
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
            <button type="submit" className="flex-1 btn-illary">
              Confirmar Reserva
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}