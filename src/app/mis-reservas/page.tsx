"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchMyReservations, fetchRooms } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"

/** Tipos mínimos locales para evitar dependencias externas */
type Reservation = {
  id: number
  userId: number
  roomId: number
  checkInDate: string
  checkOutDate: string
  adults: number
  children?: number | null
  totalAmount: number | string
  status: string
  paymentStatus: string
  specialRequests?: string | null
  aiNotes?: string | null
  createdAt: string
  updatedAt: string
}

type RoomBasic = { id: number; roomNumber: string }

/** Normaliza cualquier payload a array */
function toArray<T>(payload: any): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (payload && Array.isArray(payload.data)) return payload.data as T[]
  if (payload && Array.isArray(payload.items)) return payload.items as T[]
  return []
}

/** Utilidades de formato */
function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  } catch {
    return iso
  }
}

export default function MisReservasPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [roomIndex, setRoomIndex] = useState<Record<number, string>>({})

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("access_token")
      if (!token) {
        router.replace("/login")
        return
      }
      try {
        // Carga reservas y rooms en paralelo
        const [resvsRaw, roomsRaw] = await Promise.all([
          fetchMyReservations(token), // puede ser [] o {data:[]}
          fetchRooms(),               // puede ser [] o {data:[]}
        ])

        const resvs = toArray<Reservation>(resvsRaw)
        const rooms = toArray<RoomBasic>(roomsRaw)

        setReservations(resvs)

        // Índice id -> roomNumber para mostrar número real de habitación
        const idx: Record<number, string> = {}
        for (const r of rooms) idx[r.id] = r.roomNumber
        setRoomIndex(idx)
      } catch (e: any) {
        const msg = e?.message || ""
        if (msg.includes("401") || msg.toLowerCase().includes("unauthorized")) {
          router.replace("/login")
          return
        }
        setError(msg || "No se pudieron cargar tus reservas.")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  const roomLabel = (roomId: number) => roomIndex[roomId] ?? `#${roomId}`

  if (loading) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-serif text-[#9F836A] mb-6">Mis reservas</h1>
        <div className="space-y-4">
          <div className="h-24 rounded-xl border animate-pulse" />
          <div className="h-24 rounded-xl border animate-pulse" />
          <div className="h-24 rounded-xl border animate-pulse" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-serif text-[#9F836A] mb-6">Mis reservas</h1>
        <div className="rounded-xl border p-6">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.refresh()}>Reintentar</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-3xl font-serif text-[#9F836A] mb-6">Mis reservas</h1>

      {reservations.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="text-muted-foreground mb-4">Aún no tienes reservas registradas.</p>
          <Button onClick={() => router.push("/")}>Ver habitaciones</Button>
        </div>
      ) : (
        <ul className="grid gap-4">
          {reservations.map((r) => (
            <li key={r.id} className="rounded-xl border p-5 hover:shadow-sm transition">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-medium">Reserva #{r.id}</h2>
                  <p className="text-sm text-muted-foreground">
                    Habitación: <span className="font-medium">{roomLabel(r.roomId)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Check-in: <span className="font-medium">{fmtDate(r.checkInDate)}</span> — Check-out:{" "}
                    <span className="font-medium">{fmtDate(r.checkOutDate)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Huéspedes: <span className="font-medium">{r.adults} adultos</span>
                    {typeof r.children === "number" && r.children > 0 ? (
                      <> · <span className="font-medium">{r.children} niños</span></>
                    ) : null}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">
                    Estado: <span className="font-semibold">{r.status}</span>
                  </p>
                  <p className="text-sm">
                    Pago: <span className="font-semibold">{r.paymentStatus}</span>
                  </p>
                  <p className="text-base mt-1">
                    Total: <span className="font-semibold">S/ {Number(r.totalAmount).toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {(r.specialRequests || r.aiNotes) && (
                <div className="mt-3 text-sm">
                  {r.specialRequests && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Solicitudes especiales:</span> {r.specialRequests}
                    </p>
                  )}
                  {r.aiNotes && (
                    <p className="text-muted-foreground">
                      <span className="font-medium">Notas IA:</span> {r.aiNotes}
                    </p>
                  )}
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-xs text-muted-foreground">Creada: {fmtDate(r.createdAt)}</span>
                <span className="text-xs text-muted-foreground">Actualizada: {fmtDate(r.updatedAt)}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}