"use client"

import type { Room } from "@/lib/types/room"
import { RoomForm } from "./RoomForm"

interface RoomModalProps {
  isOpen: boolean
  editing: Room | null
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  isSaving: boolean
}

export function RoomModal({ isOpen, editing, onClose, onSubmit, isSaving }: RoomModalProps) {
  if (!isOpen) return null

  // Estado inicial vacío para crear nueva habitación
  const emptyRoom: Room = {
    id: 0,
    roomNumber: "",
    floor: 1,
    status: "available",
    maxOccupancy: 2,
    pricePerNight: 0,
    description: "",
    features: [],
    establishmentId: 1, // Deberías manejar esto dinámicamente si tienes múltiples sedes
    roomTypeId: 1,      // Valor por defecto
    createdBy: 0
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2">
          <ModalHeader
            title={editing ? `Editar Habitación ${editing.roomNumber}` : "Nueva Habitación"}
            onClose={onClose}
            disabled={isSaving}
          />
        </div>

        <div className="p-6 pt-0 overflow-hidden flex-1">
          <RoomForm
            initialData={editing ?? emptyRoom}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSaving={isSaving}
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