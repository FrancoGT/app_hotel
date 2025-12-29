"use client"

import type { Reservation, ReservationAdmin } from "@/lib/types/reservation"
import { ReservationForm } from "./ReservationForm"

interface ReservationModalProps {
  isOpen: boolean
  // Ahora permite editar reservas con info de admin
  editing: Reservation | ReservationAdmin | null
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  isSaving: boolean
}

export function ReservationModal({ isOpen, editing, onClose, onSubmit, isSaving }: ReservationModalProps) {
  if (!isOpen) return null

  // Helper para fecha de hoy en formato YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

  // Estado inicial vacío para crear nueva reserva
  const emptyReservation: Partial<Reservation> = {
    roomId: 0,
    checkInDate: today,
    checkOutDate: tomorrow,
    adults: 2,
    children: 0,
    totalAmount: 0,
    specialRequests: "",
    aiNotes: "",
    status: "confirmed",
    paymentStatus: "pending"
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2">
          <ModalHeader
            title={editing ? `Editar Reserva #${editing.id}` : "Nueva Reserva Manual"}
            onClose={onClose}
            disabled={isSaving}
          />
        </div>

        <div className="p-6 pt-0 overflow-hidden flex-1">
          <ReservationForm
            initialData={editing ?? (emptyReservation as Reservation)}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSaving={isSaving}
            isEditing={!!editing}
          />
        </div>
      </div>
    </div>
  )
}

interface ModalHeaderProps {
  title: string
  onClose: () => void
  disabled: boolean
}

function ModalHeader({ title, onClose, disabled }: ModalHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-[var(--dark-color)]">{title}</h2>
      <button
        className="text-xs text-[var(--color-500)] hover:text-[var(--dark-color)] disabled:opacity-50 p-2"
        onClick={onClose}
        disabled={disabled}
      >
        ✕ Cerrar
      </button>
    </div>
  )
}