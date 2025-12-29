"use client"

import type { Establishment } from "@/lib/types/establishment"
import { EstablishmentForm } from "./EstablishmentForm"

interface EstablishmentModalProps {
  isOpen: boolean
  editing: Establishment | null
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  isSaving: boolean
}

export function EstablishmentModal({ isOpen, editing, onClose, onSubmit, isSaving }: EstablishmentModalProps) {
  if (!isOpen) return null

  const emptyEstablishment: Establishment = {
    id: 0,
    name: "",
    address: "",
    city: "",
    phone: "",
    status: "A",
    description: "",
    country: "Perú",
    zipCode: "",
    email: "",
    website: "",
    stars: 0,
    checkInTime: "14:00:00",
    checkOutTime: "12:00:00",
    latitude: null,
    longitude: null,
    aiSettings: {
      auto_pricing: false,
      welcome_message: true,
    },
    createdBy: null,
    updatedBy: null,
    createdAt: null,
    updatedAt: null,
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2">
          <ModalHeader
            title={editing ? "Editar establecimiento" : "Nuevo establecimiento"}
            onClose={onClose}
            disabled={isSaving}
          />
        </div>

        <div className="p-6 pt-0 overflow-hidden flex-1">
          <EstablishmentForm
            initialData={editing ?? emptyEstablishment}
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
