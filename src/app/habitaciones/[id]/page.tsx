"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Users } from "lucide-react"
import { RoomPhoto } from "@/components/client/rooms/RoomPhoto"
import { LoadingIndicator } from "@/components/common/LoadingIndicator"
import { ErrorDisplay } from "@/components/common/ErrorDisplay"
import { BOOKING_PATH, HOTEL, PUBLISH_ROOM_PHOTOS } from "@/config/hotel"
import { ApiError } from "@/lib/http"
import { imageService } from "@/lib/services/imageService"
import { roomService } from "@/lib/services/roomService"
import { roomTypeService } from "@/lib/services/roomTypeService"
import { formatCurrency } from "@/lib/utils/format"
import {
  capacityLabel,
  publicDescription,
  publicFeatures,
  roomTitle,
  withTypeNames,
  type CatalogRoom,
} from "@/lib/utils/roomContent"

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [room, setRoom] = useState<CatalogRoom | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await roomService.getById(Number(id))
      const [types, mainImage] = await Promise.all([
        roomTypeService.list().catch(() => []),
        PUBLISH_ROOM_PHOTOS ? imageService.getMainUrl("room", data.id).catch(() => undefined) : undefined,
      ])
      setRoom({ ...withTypeNames([data], types)[0], mainImage })
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? "No encontramos esta habitación."
          : "No pudimos cargar la habitación en este momento."
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    void load()
  }, [load])

  if (loading) return <LoadingIndicator message="Cargando habitación..." />
  if (error || !room) return <ErrorDisplay error={error ?? "No encontramos esta habitación."} onRetry={load} />

  const title = roomTitle(room)
  const description = publicDescription(room)
  const features = publicFeatures(room)

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/#habitaciones" className="mb-4 inline-flex items-center gap-1 text-[var(--illary-primary)] hover:underline">
        <ArrowLeft aria-hidden className="h-4 w-4" />
        Volver a habitaciones
      </Link>

      <article className="grid overflow-hidden rounded-2xl border border-[var(--illary-line)] bg-white md:grid-cols-2">
        <RoomPhoto src={room.mainImage} alt={`${title} del Hotel Illari`} priority />

        <div className="flex flex-col p-6">
          <h1 className="font-serif text-3xl text-[var(--illary-ink)]">{title}</h1>
          <p className="text-sm text-[var(--illary-text)]">Habitación N.° {room.roomNumber}</p>

          <dl className="mt-5 space-y-3 text-[var(--illary-ink)]">
            <div className="flex items-center gap-2">
              <dt className="sr-only">Capacidad</dt>
              <Users aria-hidden className="h-5 w-5 text-[var(--illary-primary)]" />
              <dd>{capacityLabel(room.maxOccupancy)}</dd>
            </div>
            {description && (
              <div>
                <dt className="font-semibold">Descripción</dt>
                <dd className="text-[var(--illary-text)]">{description}</dd>
              </div>
            )}
            {features.length > 0 && (
              <div>
                <dt className="font-semibold">Servicios</dt>
                <dd className="text-[var(--illary-text)]">{features.join(", ")}</dd>
              </div>
            )}
          </dl>

          <p className="mt-4 text-[var(--illary-text)]">
            Para conocer el tipo de cama y los servicios de esta habitación, llámanos al{" "}
            <a href={HOTEL.phoneHref} className="font-semibold underline underline-offset-4">
              {HOTEL.phoneDisplay}
            </a>
            .
          </p>

          <p className="mt-6 text-3xl font-bold text-[var(--illary-primary)]">
            {formatCurrency(room.pricePerNight)}
            <span className="ml-1 text-base font-normal text-[var(--illary-text)]">por noche</span>
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link href={`${BOOKING_PATH}?habitacion=${room.id}`} className="btn-illary flex-1">
              Solicitar reserva
            </Link>
            <a href={HOTEL.phoneHref} className="btn-illary-outline flex-1">
              Llamar al hotel
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
