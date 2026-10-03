import Link from "next/link"
import { HOTEL } from "@/config/hotel"

export function Footer() {
  return (
    <footer className="border-t border-[var(--illary-line)] bg-[var(--illary-ink)] text-[#f5efe6]">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm md:grid-cols-3 md:px-6">
        <div>
          <p className="font-serif text-lg font-semibold text-white">{HOTEL.name}</p>
          <p className="mt-1">{HOTEL.address}</p>
        </div>
        <div>
          <p className="font-semibold text-white">Teléfono</p>
          <a href={HOTEL.phoneHref} className="mt-1 inline-block text-[#f5efe6] underline underline-offset-4 hover:text-white">
            {HOTEL.phoneDisplay}
          </a>
        </div>
        <nav aria-label="Pie de página" className="flex flex-col gap-1">
          <Link href="/nosotros" className="text-[#f5efe6] hover:text-white hover:underline">
            Nosotros
          </Link>
          <Link href="/#ubicacion" className="text-[#f5efe6] hover:text-white hover:underline">
            Ubicación
          </Link>
          <Link href="/login" className="text-[#f5efe6] hover:text-white hover:underline">
            Acceso de clientes
          </Link>
        </nav>
      </div>
    </footer>
  )
}
