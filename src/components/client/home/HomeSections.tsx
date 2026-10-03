import Link from "next/link"
import { MapPin, Phone, MessageSquareText, Building2, CalendarSearch } from "lucide-react"
import { BOOKING_PATH, HOTEL } from "@/config/hotel"

export function HeroSection() {
  return (
    <section
      aria-labelledby="hero-title"
      className="rounded-2xl border border-[var(--illary-line)] bg-gradient-to-br from-[var(--illary-sand)] to-white px-5 py-10 md:px-12 md:py-16"
    >
      <div className="max-w-2xl">
        <h1 id="hero-title" className="font-serif text-3xl text-[var(--illary-ink)] md:text-5xl">
          {HOTEL.name} en {HOTEL.city}
        </h1>
        <p className="mt-4 text-lg text-[var(--illary-text)]">
          Conoce nuestras habitaciones y consulta disponibilidad para tu próxima estancia.
        </p>
        <p className="mt-3 flex items-start gap-2 text-[var(--illary-ink)]">
          <MapPin aria-hidden className="mt-1 h-5 w-5 shrink-0 text-[var(--illary-primary)]" />
          {HOTEL.address}.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href={BOOKING_PATH} className="btn-illary px-6 text-base">
            Consultar disponibilidad
          </Link>
          <a href={HOTEL.phoneHref} className="btn-illary-outline gap-2 px-6 text-base">
            <Phone aria-hidden className="h-5 w-5" />
            Llamar al hotel
          </a>
        </div>
      </div>
    </section>
  )
}

const SERVICES = [
  {
    icon: Building2,
    title: `${HOTEL.totalRooms} habitaciones`,
    text: "Te ayudamos a elegir la opción adecuada para tu grupo y tus fechas.",
  },
  {
    icon: Phone,
    title: "Atención directa",
    text: `Habla con el hotel al ${HOTEL.phoneDisplay} para resolver tus dudas y coordinar tu estancia.`,
  },
  {
    icon: CalendarSearch,
    title: "Solicitud de reserva en línea",
    text: "Indica tus fechas y el hotel verificará la disponibilidad antes de confirmar.",
  },
]

export function ServicesSection() {
  return (
    <section id="servicios" aria-labelledby="servicios-title" className="scroll-mt-24">
      <h2 id="servicios-title" className="font-serif text-2xl text-[var(--illary-ink)] md:text-3xl">
        Servicios
      </h2>
      <ul className="mt-5 grid gap-4 p-0 md:grid-cols-3">
        {SERVICES.map(({ icon: Icon, title, text }) => (
          <li key={title} className="mb-0 list-none rounded-xl border border-[var(--illary-line)] bg-white p-5">
            <Icon aria-hidden className="h-6 w-6 text-[var(--illary-primary)]" />
            <h3 className="mt-3 text-lg text-[var(--illary-ink)]">{title}</h3>
            <p className="mt-1 text-[var(--illary-text)]">{text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[var(--illary-text)]">
        Para conocer los servicios incluidos en cada habitación, consúltanos por teléfono.
      </p>
    </section>
  )
}

export function LocationContactSection() {
  return (
    <section id="ubicacion" aria-labelledby="ubicacion-title" className="scroll-mt-24">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-xl border border-[var(--illary-line)] bg-white p-6">
          <h2 id="ubicacion-title" className="font-serif text-2xl text-[var(--illary-ink)]">
            Ubicación
          </h2>
          <p className="mt-3 flex items-start gap-2 text-[var(--illary-ink)]">
            <MapPin aria-hidden className="mt-1 h-5 w-5 shrink-0 text-[var(--illary-primary)]" />
            {HOTEL.address}
          </p>
          <a href={HOTEL.mapsUrl} target="_blank" rel="noopener noreferrer" className="btn-illary mt-5">
            Cómo llegar
            <span className="sr-only"> (abre Google Maps en una pestaña nueva)</span>
          </a>
        </div>

        <div id="contacto" className="scroll-mt-24 rounded-xl border border-[var(--illary-line)] bg-white p-6">
          <h2 className="font-serif text-2xl text-[var(--illary-ink)]">Contacto</h2>
          <p className="mt-3 flex items-center gap-2 text-[var(--illary-ink)]">
            <Phone aria-hidden className="h-5 w-5 text-[var(--illary-primary)]" />
            <a href={HOTEL.phoneHref} className="text-lg font-semibold underline underline-offset-4">
              {HOTEL.phoneDisplay}
            </a>
          </p>
          <p className="mt-3 flex items-start gap-2 text-[var(--illary-text)]">
            <MessageSquareText aria-hidden className="mt-1 h-5 w-5 shrink-0 text-[var(--illary-primary)]" />
            También puedes completar una solicitud de reserva con tus fechas; el hotel verificará la disponibilidad.
          </p>
          <Link href={BOOKING_PATH} className="btn-illary-outline mt-5">
            Solicitar reserva
          </Link>
        </div>
      </div>
    </section>
  )
}
