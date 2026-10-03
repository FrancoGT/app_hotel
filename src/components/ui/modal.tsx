"use client"

import type { ReactNode } from "react"

interface ModalProps {
  title: string
  onClose: () => void
  // Bloquea el cierre mientras se guarda
  disabled?: boolean
  children: ReactNode
}

export function Modal({ title, onClose, disabled, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-2xl flex flex-col max-h-[90vh]">
        <div className="p-6 pb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--dark-color)]">{title}</h2>
          <button
            className="text-xs text-[var(--color-500)] hover:text-[var(--dark-color)] disabled:opacity-50 p-2"
            onClick={onClose}
            disabled={disabled}
          >
            ✕ Cerrar
          </button>
        </div>
        <div className="p-6 pt-2 overflow-hidden flex-1">{children}</div>
      </div>
    </div>
  )
}
