"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchCurrentUser, type CurrentUser } from "@/lib/fetcher"
import { Building2, Bed, CalendarCheck } from "lucide-react"

type AdminState = "loading" | "unauthenticated" | "unauthorized" | "ready"

export default function AdminPage() {
  const router = useRouter()
  const [state, setState] = useState<AdminState>("loading")
  const [user, setUser] = useState<CurrentUser | null>(null)

  useEffect(() => {
    const checkAdmin = async () => {
      if (typeof window === "undefined") return

      const token = localStorage.getItem("access_token")
      if (!token) {
        setState("unauthenticated")
        return
      }

      try {
        const me = await fetchCurrentUser(token)
        console.log("DEBUG /admin -> fetchCurrentUser:", me)

        setUser(me)

        const isAdminFlag =
          me.admin === true || (Array.isArray(me.roles) && me.roles.includes("Administradores"))

        if (!isAdminFlag) {
          setState("unauthorized")
          return
        }

        setState("ready")
      } catch (err) {
        console.error("Error verificando admin en /admin:", err)
        setState("unauthenticated")
      }
    }

    checkAdmin()
  }, [])

  // ===== VISTAS DE ESTADO CON ESTILO TIPO layout-c =====

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
            Necesitas iniciar sesión para acceder al panel de gestión.
          </p>
          <button
            onClick={() => router.push("/login")}
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
            onClick={() => router.push("/")}
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

  // ===== VISTA PRINCIPAL PANEL ADMIN (ESTILO DASHBOARD layout-c) =====

  return (
    <div className="min-h-screen bg-[var(--body-color)]">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
        {/* Encabezado */}
        <header className="mb-10">
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--dark-color)] mb-2">
            Panel de Gestión
          </h1>
          <p className="text-sm text-[var(--color-500)]">
            Bienvenido,&nbsp;
            <span className="font-medium text-[var(--dark-color)]">
              {user?.displayName || user?.login}
            </span>
          </p>
        </header>

        {/* Tarjetas de navegación */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card: Gestionar establecimientos */}
          <article
            className="bg-[var(--card-color)] border border-[var(--border-color)] 
                       rounded-2xl p-6 lg:p-7 flex flex-col items-center text-center 
                       shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 lg:w-18 lg:h-18 rounded-full 
                            flex items-center justify-center mb-5
                            bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-base lg:text-lg font-semibold text-[var(--dark-color)] mb-3">
              Gestionar Establecimientos
            </h2>
            <p className="text-xs lg:text-sm text-[var(--color-500)] mb-6 leading-relaxed">
              Administra tus establecimientos, actualiza información, gestiona servicios y visualiza
              estadísticas de cada ubicación.
            </p>
            <button
              onClick={() => router.push("/admin/establishments")}
              className="mt-auto inline-flex items-center justify-center px-6 py-2.5 
                         rounded-xl bg-[var(--primary-color)] text-white text-sm font-medium 
                         hover:brightness-110 transition-all shadow-sm"
            >
              Ingresar
            </button>
          </article>

          {/* Card: Gestionar habitaciones */}
          <article
            className="bg-[var(--card-color)] border border-[var(--border-color)] 
                       rounded-2xl p-6 lg:p-7 flex flex-col items-center text-center 
                       shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 lg:w-18 lg:h-18 rounded-full 
                            flex items-center justify-center mb-5
                            bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <Bed className="w-8 h-8" />
            </div>
            <h2 className="text-base lg:text-lg font-semibold text-[var(--dark-color)] mb-3">
              Gestionar Habitaciones
            </h2>
            <p className="text-xs lg:text-sm text-[var(--color-500)] mb-6 leading-relaxed">
              Administra las habitaciones disponibles, actualiza precios, fotos, disponibilidad y
              características de cada habitación.
            </p>
            <button
              onClick={() => router.push("/admin/rooms")}
              className="mt-auto inline-flex items-center justify-center px-6 py-2.5 
                         rounded-xl bg-[var(--primary-color)] text-white text-sm font-medium 
                         hover:brightness-110 transition-all shadow-sm"
            >
              Ingresar
            </button>
          </article>

          {/* Card: Gestionar reservas */}
          <article
            className="bg-[var(--card-color)] border border-[var(--border-color)] 
                       rounded-2xl p-6 lg:p-7 flex flex-col items-center text-center 
                       shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 lg:w-18 lg:h-18 rounded-full 
                            flex items-center justify-center mb-5
                            bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <h2 className="text-base lg:text-lg font-semibold text-[var(--dark-color)] mb-3">
              Gestionar Reservas
            </h2>
            <p className="text-xs lg:text-sm text-[var(--color-500)] mb-6 leading-relaxed">
              Revisa todas las reservas, confirma disponibilidad, gestiona pagos y mantén actualizado
              el estado de cada reserva.
            </p>
            <button
              onClick={() => router.push("/admin/reservations")}
              className="mt-auto inline-flex items-center justify-center px-6 py-2.5 
                         rounded-xl bg-[var(--primary-color)] text-white text-sm font-medium 
                         hover:brightness-110 transition-all shadow-sm"
            >
              Ingresar
            </button>
          </article>
        </section>
      </div>
    </div>
  )
}
