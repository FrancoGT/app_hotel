"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { fetchMyReservations, fetchRooms } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"

/** Tipos mínimos locales */
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

/** Utilidades de formato de fecha */
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

// --- NUEVO COMPONENTE PARA LAS ETIQUETAS ---
function StatusBadge({ status, type }: { status: string; type: 'general' | 'payment' }) {
  const s = status?.toLowerCase() || ""
  
  // Configuración por defecto
  let styles = "bg-slate-100 text-slate-600 border-slate-200"
  let label = status || "N/A"

  if (type === 'general') {
    // Estados de la Reserva
    if (s === 'confirmed' || s === 'confirmada') {
      styles = "bg-emerald-100 text-emerald-700 border-emerald-200"
      label = "Confirmada"
    } else if (s === 'cancelled' || s === 'cancelada') {
      styles = "bg-red-100 text-red-700 border-red-200"
      label = "Cancelada"
    } else if (s === 'checked_in') {
      styles = "bg-blue-100 text-blue-700 border-blue-200"
      label = "En Estadía"
    } else if (s === 'checked_out') {
      styles = "bg-gray-100 text-gray-700 border-gray-200"
      label = "Finalizada"
    } else if (s === 'pending' || s === 'pendiente') {
      styles = "bg-amber-100 text-amber-700 border-amber-200"
      label = "Pendiente"
    }
  } else {
    // Estados del Pago
    if (s === 'paid' || s === 'pagado') {
      styles = "bg-emerald-100 text-emerald-700 border-emerald-200"
      label = "Pagado"
    } else if (s === 'pending' || s === 'pendiente') {
      styles = "bg-amber-100 text-amber-700 border-amber-200"
      label = "Pendiente"
    } else if (s === 'refunded' || s === 'reembolsado') {
      styles = "bg-purple-100 text-purple-700 border-purple-200"
      label = "Reembolsado"
    }
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${styles}`}>
      {label}
    </span>
  )
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
        const [resvsRaw, roomsRaw] = await Promise.all([
          fetchMyReservations(token),
          fetchRooms(),
        ])

        const resvs = toArray<Reservation>(resvsRaw)
        const rooms = toArray<RoomBasic>(roomsRaw)

        setReservations(resvs)

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
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-serif text-[#9F836A] mb-6">Mis reservas</h1>
        <div className="space-y-4">
          <div className="h-32 rounded-lg border bg-slate-50 animate-pulse" />
          <div className="h-32 rounded-lg border bg-slate-50 animate-pulse" />
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-serif text-[#9F836A] mb-6">Mis reservas</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.refresh()}>Reintentar</Button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-serif text-[#9F836A] mb-6">Mis reservas</h1>

      {reservations.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground mb-4">Aún no tienes reservas registradas.</p>
          <Button onClick={() => router.push("/")}>Ver habitaciones</Button>
        </div>
      ) : (
        <ul className="grid gap-4">
          {reservations.map((r) => (
            <li key={r.id} className="card hover:shadow-lg transition-shadow bg-white border rounded-xl p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                
                {/* Columna Izquierda: Información Principal */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">Reserva #{r.id}</h2>
                    <span className="text-xs text-gray-400 font-mono">
                      {fmtDate(r.createdAt)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    <p>Habitación: <span className="font-medium text-gray-900">{roomLabel(r.roomId)}</span></p>
                    <p>
                        Del <span className="font-medium text-gray-900">{fmtDate(r.checkInDate)}</span> al{" "}
                        <span className="font-medium text-gray-900">{fmtDate(r.checkOutDate)}</span>
                    </p>
                    <p>
                      {r.adults} adultos
                      {typeof r.children === "number" && r.children > 0 && `, ${r.children} niños`}
                    </p>
                  </div>
                </div>

                {/* Columna Derecha: Estados y Precio */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-2">
                  <div className="flex flex-col items-end gap-2">
                    {/* AQUI SE USAN LOS NUEVOS BADGES */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden md:inline">Estado:</span>
                        <StatusBadge status={r.status} type="general" />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden md:inline">Pago:</span>
                        <StatusBadge status={r.paymentStatus} type="payment" />
                    </div>
                  </div>
                  
                  <div className="text-right mt-2">
                     <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                     <p className="text-xl font-bold text-[#9F836A]">S/ {Number(r.totalAmount).toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Pie de tarjeta: Notas adicionales */}
              {(r.specialRequests || r.aiNotes) && (
                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 -mx-5 -mb-5 p-4 rounded-b-xl text-sm">
                  {r.specialRequests && (
                    <div className="mb-2">
                        <span className="font-semibold text-gray-700 text-xs uppercase">Solicitudes especiales:</span>
                        <p className="text-gray-600 italic">"{r.specialRequests}"</p>
                    </div>
                  )}
                  {r.aiNotes && (
                     <div>
                        <span className="font-semibold text-gray-700 text-xs uppercase">Notas del sistema:</span>
                        <p className="text-gray-500 text-xs">{r.aiNotes}</p>
                     </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}