import Image from "next/image"
import Link from "next/link"
import { BOOKING_PATH, HOTEL } from "@/config/hotel"

export default function NosotrosPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid items-start gap-6 rounded-2xl border border-[var(--illary-line)] bg-white p-6 md:grid-cols-[1fr_260px] md:p-8">
        <div>
          <h1 className="font-serif text-3xl text-[var(--illary-ink)]">Nosotros</h1>
          <p className="mt-4 text-lg leading-relaxed text-[var(--illary-text)]">
            Hotel Illari es un hotel pequeño ubicado en la avenida Vidaurrazaga, en Arequipa. Contamos con{" "}
            {HOTEL.totalRooms} habitaciones y ofrecemos atención directa para ayudarte a elegir tu alojamiento y
            coordinar tu estancia. Consulta con nosotros las opciones disponibles para tus fechas de viaje.
          </p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link href={BOOKING_PATH} className="btn-illary">
              Consultar disponibilidad
            </Link>
            <a href={HOTEL.phoneHref} className="btn-illary-outline">
              Llamar al {HOTEL.phoneDisplay}
            </a>
          </div>
        </div>

        <figure className="mx-auto w-full max-w-[260px]">
          <Image
            src={HOTEL.facadePhoto.src}
            alt={HOTEL.facadePhoto.alt}
            width={HOTEL.facadePhoto.width}
            height={HOTEL.facadePhoto.height}
            sizes="260px"
            className="h-auto w-full rounded-xl"
          />
          <figcaption className="mt-2 text-center text-sm text-[var(--illary-text)]">{HOTEL.address}</figcaption>
        </figure>
      </div>
    </div>
  )
}
