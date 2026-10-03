"use client"

interface ConfirmDialogProps {
  message: string | null
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

// Se muestra mientras `message` no sea null
export function ConfirmDialog({ message, confirmLabel = "Eliminar", onConfirm, onCancel }: ConfirmDialogProps) {
  if (!message) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Confirmar acción</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
