import { Tailspin } from "ldrs/react"
import "ldrs/react/Tailspin.css"

export function LoadingIndicator({ message = "Cargando..." }: { message?: string }) {
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[400px]">
      <div className="text-center flex flex-col items-center gap-4">
        <Tailspin size="48" stroke="5" speed="0.9" color="var(--illary-primary)" />
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  )
}
