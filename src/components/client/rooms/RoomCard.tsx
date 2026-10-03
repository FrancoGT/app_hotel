import Link from "next/link"
import { Users } from "lucide-react"
import { BOOKING_PATH } from "@/config/hotel"
import { formatCurrency } from "@/lib/utils/format"
import { capacityLabel, publicDescription, publicFeatures, roomTitle, type CatalogRoom } from "@/lib/utils/roomContent"
import { RoomPhoto } from "./RoomPhoto"

export function RoomCard({ room }: { room: CatalogRoom }) {
  const title = roomTitle(room)
  const description = publicDescription(room)
  const features = publicFeatures(room)

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-[var(--illary-line)] bg-white shadow-sm">
      <RoomPhoto src={room.mainImage} alt={`${title} del Hotel Illari`} />

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl font-serif font-semibold text-[var(--illary-ink)]">{title}</h3>
        <p className="mb-3 text-sm text-[var(--illary-text)]">Habitación N.° {room.roomNumber}</p>

        <p className="mb-3 flex items-center gap-2 text-sm text-[var(--illary-ink)]">
          <Users aria-hidden className="h-4 w-4 text-[var(--illary-primary)]" />
          {capacityLabel(room.maxOccupancy)}
        </p>

        {description && <p className="mb-3 text-sm leading-relaxed text-[var(--illary-text)]">{description}</p>}

        {features.length > 0 && (
          <ul className="mb-3 list-disc pl-5 text-sm text-[var(--illary-text)]">
            {features.map((feature) => (
              <li key={feature} className="mb-0.5">
                {feature}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-2">
          <p className="mb-4 text-2xl font-bold text-[var(--illary-primary)]">
            {formatCurrency(room.pricePerNight)}
            <span className="ml-1 text-sm font-normal text-[var(--illary-text)]">por noche</span>
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/habitaciones/${room.id}`} className="btn-illary-outline">
              Ver habitación
            </Link>
            <Link href={`${BOOKING_PATH}?habitacion=${room.id}`} className="btn-illary">
              Solicitar reserva
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
