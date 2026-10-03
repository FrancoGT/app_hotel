"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"

interface RequireAuthProps {
  // Si es true, además de iniciar sesión el usuario debe ser administrador
  requireAdmin?: boolean
  children: ReactNode
}

export function RequireAuth({ requireAdmin = false, children }: RequireAuthProps) {
  const { isLoading, isLoggedIn, isAdmin } = useAuth()

  if (isLoading) {
    return (
      <GuardMessage>
        <p className="text-base text-[var(--dark-color)]">Verificando permisos…</p>
      </GuardMessage>
    )
  }

  if (!isLoggedIn) {
    return (
      <GuardMessage>
        <p className="text-[var(--dark-color)] text-base">Necesitas iniciar sesión para acceder a esta sección.</p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[var(--primary-color)] text-white text-sm font-medium hover:brightness-110 transition-all shadow-sm"
        >
          Ir a iniciar sesión
        </Link>
      </GuardMessage>
    )
  }

  if (requireAdmin && !isAdmin) {
    return (
      <GuardMessage>
        <p className="text-sm font-semibold text-red-600">
          No tienes permisos de administrador para acceder a esta sección.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[var(--dark-color)] text-white text-sm font-medium hover:brightness-110 transition-all shadow-sm"
        >
          Volver al inicio
        </Link>
      </GuardMessage>
    )
  }

  return <>{children}</>
}

function GuardMessage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="px-8 py-6 rounded-2xl bg-[var(--card-color)] border border-[var(--border-color)] shadow-sm max-w-md w-full text-center space-y-4">
        {children}
      </div>
    </div>
  )
}
