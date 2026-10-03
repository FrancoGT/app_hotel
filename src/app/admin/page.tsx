"use client"

import Link from "next/link"
import { Building2, Bed, CalendarCheck, type LucideIcon } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

const SECTIONS: { href: string; title: string; description: string; icon: LucideIcon }[] = [
  {
    href: "/admin/establishments",
    title: "Gestionar Establecimientos",
    description:
      "Administra tus establecimientos, actualiza información, gestiona servicios y visualiza estadísticas de cada ubicación.",
    icon: Building2,
  },
  {
    href: "/admin/rooms",
    title: "Gestionar Habitaciones",
    description:
      "Administra las habitaciones disponibles, actualiza precios, fotos, disponibilidad y características de cada habitación.",
    icon: Bed,
  },
  {
    href: "/admin/reservations",
    title: "Gestionar Reservas",
    description:
      "Revisa todas las reservas, confirma disponibilidad, gestiona pagos y mantén actualizado el estado de cada reserva.",
    icon: CalendarCheck,
  },
]

export default function AdminPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <header className="mb-10">
        <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--dark-color)] mb-2">Panel de Gestión</h1>
        <p className="text-sm text-[var(--color-500)]">
          Bienvenido,&nbsp;
          <span className="font-medium text-[var(--dark-color)]">{user?.name}</span>
        </p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SECTIONS.map(({ href, title, description, icon: Icon }) => (
          <article
            key={href}
            className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl p-6 lg:p-7 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5 bg-[var(--primary-color)]/10 text-[var(--primary-color)]">
              <Icon className="w-8 h-8" />
            </div>
            <h2 className="text-base lg:text-lg font-semibold text-[var(--dark-color)] mb-3">{title}</h2>
            <p className="text-xs lg:text-sm text-[var(--color-500)] mb-6 leading-relaxed">{description}</p>
            <Link
              href={href}
              className="mt-auto inline-flex items-center justify-center px-6 py-2.5 rounded-xl bg-[var(--primary-color)] text-white text-sm font-medium hover:brightness-110 transition-all shadow-sm"
            >
              Ingresar
            </Link>
          </article>
        ))}
      </section>
    </div>
  )
}
