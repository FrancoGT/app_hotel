"use client"

import type { Reservation, ReservationAdmin } from "@/lib/types/reservation"

interface ReservationsTableProps {
  // Ahora aceptamos una lista que puede tener Reservas normales o de Admin (con usuario)
  items: (Reservation | ReservationAdmin)[]
  onEdit: (reservation: Reservation | ReservationAdmin) => void
  onDelete: (reservation: Reservation | ReservationAdmin) => void
}

export function ReservationsTable({ items, onEdit, onDelete }: ReservationsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-color)] bg-[var(--body-color)]/40">
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Nº</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Cliente</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Habitación</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Fechas</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Huéspedes</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Total</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Estado</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Pago</th>
            <th className="px-4 py-3 text-right font-semibold text-[var(--color-500)]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((res) => (
            <ReservationTableRow key={res.id} reservation={res} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ReservationTableRowProps {
  reservation: Reservation | ReservationAdmin
  onEdit: (reservation: Reservation | ReservationAdmin) => void
  onDelete: (reservation: Reservation | ReservationAdmin) => void
}

function ReservationTableRow({ reservation, onEdit, onDelete }: ReservationTableRowProps) {
  
  // Lógica para obtener el nombre del cliente
  // Verificamos si la propiedad 'user' existe en el objeto (Type Guard)
  const clientName = 'user' in reservation 
    ? `${reservation.user.first_name} ${reservation.user.last_name}`
    : `Usuario ID: ${reservation.userId}`

  const clientEmail = 'user' in reservation ? reservation.user.login : ''

  return (
    <tr className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--body-color)]/50 transition-colors">
      <td className="px-4 py-4 text-[var(--color-600)] font-mono text-xs">{reservation.id}</td>
      
      {/* NUEVA CELDA CLIENTE */}
      <td className="px-4 py-4">
        <div className="flex flex-col">
            <span className="font-medium text-[var(--dark-color)]">{clientName}</span>
            {clientEmail && <span className="text-xs text-[var(--color-400)]">{clientEmail}</span>}
        </div>
      </td>

      <td className="px-4 py-4 text-[var(--dark-color)] font-medium">Nº {reservation.roomId}</td>
      <td className="px-4 py-4 text-[var(--color-600)]">
        <div className="flex flex-col text-xs">
          <span className="whitespace-nowrap">In: {reservation.checkInDate}</span>
          <span className="whitespace-nowrap">Out: {reservation.checkOutDate}</span>
        </div>
      </td>
      <td className="px-4 py-4 text-[var(--color-600)]">
        {reservation.adults} Ad. / {reservation.children} Ni.
      </td>
      <td className="px-4 py-4 text-[var(--dark-color)] font-medium">S/ {reservation.totalAmount}</td>
      
      <td className="px-4 py-4">
        <StatusBadge status={reservation.status} type="general" />
      </td>
      
      <td className="px-4 py-4">
        <StatusBadge status={reservation.paymentStatus} type="payment" />
      </td>

      <td className="px-4 py-4 text-right">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => onEdit(reservation)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg 
                       border border-[var(--border-color)] text-[var(--color-600)]
                       hover:border-[var(--dark-color)] hover:text-[var(--dark-color)]
                       hover:bg-[var(--body-color)]/60 transition-all"
            title="Editar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          </button>
          <button
            onClick={() => onDelete(reservation)}
            className="inline-flex items-center justify-center w-8 h-8 rounded-lg 
                       border border-[var(--border-color)] text-[var(--color-600)]
                       hover:border-red-500 hover:text-red-600 hover:bg-red-50
                       transition-all"
            title="Cancelar/Eliminar"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

function StatusBadge({ status, type }: { status?: string, type: 'general' | 'payment' }) {
  const s = status?.toLowerCase() || ""
  
  let styles = "bg-slate-100 text-slate-600 border-slate-200"
  let label = status || "N/A"

  if (type === 'general') {
    if (s === 'confirmed' || s === 'confirmada') {
      styles = "bg-emerald-100 text-emerald-700 border-emerald-200"
      label = "Confirmada"
    } else if (s === 'cancelled' || s === 'cancelada') {
      styles = "bg-red-100 text-red-700 border-red-200"
      label = "Cancelada"
    } else if (s === 'checked_in') {
      styles = "bg-blue-100 text-blue-700 border-blue-200"
      label = "In-House"
    } else if (s === 'checked_out') {
        styles = "bg-gray-100 text-gray-700 border-gray-200"
        label = "Finalizada"
    }
  } else {
    if (s === 'paid' || s === 'pagado') {
      styles = "bg-emerald-100 text-emerald-700 border-emerald-200"
      label = "Pagado"
    } else if (s === 'pending' || s === 'pendiente') {
      styles = "bg-amber-100 text-amber-700 border-amber-200"
      label = "Pendiente"
    } else if (s === 'refunded') {
      styles = "bg-purple-100 text-purple-700 border-purple-200"
      label = "Reembolsado"
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  )
}