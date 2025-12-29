"use client"

import type { ReactNode } from "react"

export type GuardState =
  | "loading"
  | "unauthenticated"
  | "unauthorized"
  | "ready"

interface AuthGuardProps {
  state: GuardState
  onLoginRedirect: () => void
  onHomeRedirect: () => void
  children: ReactNode
}

export function AuthGuard({
  state,
  onLoginRedirect,
  onHomeRedirect,
  children,
}: AuthGuardProps) {
  if (state === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--body-color)]">
        <div className="px-6 py-4 rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-sm">
          <p className="text-base text-[var(--dark-color)]">
            Verificando permisos…
          </p>
        </div>
      </div>
    )
  }

  if (state === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--body-color)]">
        <div className="px-8 py-6 rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-sm max-w-md w-full text-center space-y-4">
          <p className="text-[var(--dark-color)] text-base">
            Necesitas iniciar sesión para acceder a esta sección.
          </p>
          <button
            onClick={onLoginRedirect}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl 
                       bg-[var(--primary-color)] text-white text-sm font-medium 
                       hover:brightness-110 transition-all shadow-sm"
          >
            Ir a iniciar sesión
          </button>
        </div>
      </div>
    )
  }

  if (state === "unauthorized") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--body-color)]">
        <div className="px-8 py-6 rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-sm max-w-md w-full text-center space-y-4">
          <p className="text-sm font-semibold text-red-600">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
          <button
            onClick={onHomeRedirect}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl 
                       bg-[var(--dark-color)] text-white text-sm font-medium 
                       hover:brightness-110 transition-all shadow-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}