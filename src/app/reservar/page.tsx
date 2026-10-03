"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { BookingRequestForm } from "@/components/client/booking/BookingRequestForm"
import { HOTEL } from "@/config/hotel"

function BookingRequestPage() {
  const roomId = useSearchParams().get("habitacion") ?? undefined

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-3xl text-[var(--illary-ink)]">Consultar disponibilidad</h1>
      <p className="mb-6 mt-2 text-[var(--illary-text)]">
        Completa tus fechas y datos. Si prefieres, llámanos al{" "}
        <a href={HOTEL.phoneHref} className="font-semibold underline underline-offset-4">
          {HOTEL.phoneDisplay}
        </a>
        .
      </p>
      <BookingRequestForm initialRoomId={roomId} />
    </div>
  )
}

// useSearchParams necesita un límite de Suspense en las páginas estáticas
export default function ReservarPage() {
  return (
    <Suspense>
      <BookingRequestPage />
    </Suspense>
  )
}
