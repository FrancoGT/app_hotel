"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ReservationCard } from "@/components/client/reservations/ReservationCard"
import { reservationService } from "@/lib/services/reservationService"
import { roomService } from "@/lib/services/roomService"
import type { Reservation } from "@/lib/types/reservation"

export default function MisReservasPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [roomNumbers, setRoomNumbers] = useState<Record<number, string>>({})

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [myReservations, rooms] = await Promise.all([reservationService.listMy(), roomService.list()])
      setReservations(myReservations)
      setRoomNumbers(Object.fromEntries(rooms.map((r) => [r.id, r.roomNumber])))
    } catch (e) {
      setError(e instanceof Error && e.message ? e.message : "No se pudieron cargar tus reservas.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-serif text-[#9F836A] mb-6">Mis reservas</h1>

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 rounded-lg border bg-slate-50 animate-pulse" />
          <div className="h-32 rounded-lg border bg-slate-50 animate-pulse" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={load}>Reintentar</Button>
        </div>
      ) : reservations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">Aún no tienes reservas registradas.</p>
          <Button asChild>
            <Link href="/">Ver habitaciones</Link>
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4">
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} roomLabel={roomNumbers[r.roomId] ?? `#${r.roomId}`} />
          ))}
        </ul>
      )}
    </div>
  )
}
