"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Phone } from "lucide-react"
import { BOOKING_PATH, HOTEL } from "@/config/hotel"

const HIDDEN_ON = [BOOKING_PATH, "/admin", "/login", "/register"]

// Accesos fijos en celular: consultar disponibilidad y llamar
export function MobileBookingBar() {
  const pathname = usePathname()
  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null

  return (
    <>
      {/* Reserva el espacio de la barra para que no tape el final de la página */}
      <div aria-hidden className="h-20 sm:hidden" />
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-[var(--illary-line)] bg-white p-3 sm:hidden">
        <Link href={BOOKING_PATH} className="btn-illary flex-1">
          Consultar disponibilidad
        </Link>
        <a href={HOTEL.phoneHref} className="btn-illary-outline px-4" aria-label={`Llamar al hotel al ${HOTEL.phoneDisplay}`}>
          <Phone aria-hidden className="h-5 w-5" />
        </a>
      </div>
    </>
  )
}
