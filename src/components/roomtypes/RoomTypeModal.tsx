"use client"

import type { RoomType, RoomTypePayload } from "@/lib/types/room_type"
import { RoomTypeForm } from "./RoomTypeForm"

interface RoomTypeModalProps {
  isOpen: boolean
  editing: RoomType | null
  onClose: () => void
  onSubmit: (data: RoomTypePayload) => Promise<void>
  isSaving: boolean
}

export function RoomTypeModal({ isOpen, editing, onClose, onSubmit, isSaving }: RoomTypeModalProps) {
  if (!isOpen) return null

  // Estado inicial para crear nuevo Tipo
  const emptyRoomType: RoomType = {
    id: 0,
    name: "",
    description: "",
    basePrice: 0,
    capacity: 1,
    amenities: [],
    status: "A",
    createdBy: 0
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2">
          <ModalHeader
            title={editing ? `Editar Tipo: ${editing.name}` : "Nuevo Tipo de Habitación"}
            onClose={onClose}
            disabled={isSaving}
          />
        </div>

        <div className="p-6 pt-0 overflow-hidden flex-1">
          <RoomTypeForm
            initialData={editing ?? emptyRoomType}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  )
}

// Reutilizamos el Header interno o lo extraemos a un componente común UI
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