import { StatusBadge } from "@/components/ui/status-badge"
import { PAYMENT_STATUS, RESERVATION_STATUS } from "@/lib/constants/status"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import type { Reservation } from "@/lib/types/reservation"

interface ReservationCardProps {
  reservation: Reservation
  roomLabel: string
}

// Vista de solo lectura de una reserva para el cliente (el admin la gestiona en una tabla)
export function ReservationCard({ reservation: r, roomLabel }: ReservationCardProps) {
  return (
    <li className="card hover:shadow-lg transition-shadow bg-white border rounded-xl p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">Reserva #{r.id}</h2>
            <span className="text-xs text-gray-400 font-mono">{formatDate(r.createdAt)}</span>
          </div>
          <div className="text-sm text-gray-600">
            <p>
              Habitación: <span className="font-medium text-gray-900">{roomLabel}</span>
            </p>
            <p>
              Del <span className="font-medium text-gray-900">{formatDate(r.checkInDate)}</span> al{" "}
              <span className="font-medium text-gray-900">{formatDate(r.checkOutDate)}</span>
            </p>
            <p>
              {r.adults} adultos
              {!!r.children && `, ${r.children} niños`}
            </p>
          </div>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-2">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:inline">Estado:</span>
              <StatusBadge map={RESERVATION_STATUS} status={r.status} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground hidden md:inline">Pago:</span>
              <StatusBadge map={PAYMENT_STATUS} status={r.paymentStatus} />
            </div>
          </div>
          <div className="text-right mt-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
            <p className="text-xl font-bold text-[#9F836A]">{formatCurrency(r.totalAmount)}</p>
          </div>
        </div>
      </div>

      {/* aiNotes no se muestra al cliente: habla de categorías A–H del dataset de entrenamiento,
          que no corresponden a los tipos de habitación del hotel y contradirían la habitación reservada */}
      {r.specialRequests && (
        <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-5 -mb-5 p-4 rounded-b-xl text-sm">
          <span className="font-semibold text-gray-700 text-xs uppercase">Solicitudes especiales:</span>
          <p className="text-gray-600 italic">&quot;{r.specialRequests}&quot;</p>
        </div>
      )}
    </li>
  )
}
