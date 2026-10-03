"use client"

import { cn } from "@/lib/utils"
import type { ToastState } from "@/hooks/useToast"

const STYLES: Record<ToastState["type"], string> = {
  success: "bg-green-50 border-green-200 text-green-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
}

interface ToastProps {
  toast: ToastState | null
  // Si se pasa, se muestra el botón de cerrar
  onClose?: () => void
}

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4">
      <div className={cn("border p-4 rounded-xl shadow-lg backdrop-blur-sm", STYLES[toast.type])}>
        <div className="flex items-center justify-between gap-4">
          <div className={cn("flex-1", !toast.title && "text-center")}>
            {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
            <p className={cn("text-sm", toast.title ? "opacity-90" : "font-medium")}>{toast.message}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Cerrar">
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
