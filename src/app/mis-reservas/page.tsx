"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { fetchMyReservations } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"

type Reservation = {
  id: number
  roomId: number
  checkInDate: string
  checkOutDate: string
  adults: number
  children?: number
  totalAmount: number
  status: string
  paymentStatus: string
  specialRequests?: string
  aiNotes?: string
  createdAt: string
  updatedAt: string
}

export default function MisReservasPage() {
  const router = useRouter()
  const { isLoggedIn } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reservations, setReservations] = useState<Reservation[]>([])

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login")
      return
    }

    const token = localStorage.getItem("access_token")
    if (!token) {
      router.replace("/login")
      return
    }

    const loadReservations = async () => {
      try {
        const res = await fetchMyReservations(token)
        if (res.error) {
          setError(res.error.message || "Error al cargar reservas.")
        } else {
          setReservations(res.data || [])
        }
      } catch (err: any) {
        setError(err.message || "Error desconocido.")
      } finally {
        setLoading(false)
      }
    }

    loadReservations()
  }, [isLoggedIn, router])

  if (loading) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">Mis reservas</h1>
        <p>Cargando...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-2xl font-semibold mb-6">Mis reservas</h1>
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.refresh()}>Reintentar</Button>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-semibold mb-6">Mis reservas</h1>
      {reservations.length === 0 ? (
        <div className="p-6 border rounded-md text-center">
          <p className="text-muted-foreground">Aún no tienes reservas.</p>
          <Button onClick={() => router.push("/")}>Ver habitaciones</Button>
        </div>
      ) : (
        <ul className="space-y-4">
          {reservations.map((r) => (
            <li key={r.id} className="p-4 border rounded-md">
              <p><strong>Reserva #{r.id}</strong></p>
              <p>Habitación: {r.roomId}</p>
              <p>Check-in: {r.checkInDate} — Check-out: {r.checkOutDate}</p>
              <p>Huéspedes: {r.adults} adultos{r.children ? `, ${r.children} niños` : ""}</p>
              <p>Total: S/ {Number(r.totalAmount).toFixed(2)}</p>
              <p>Estado: {r.status}</p>
              <p>Pago: {r.paymentStatus}</p>
              {r.specialRequests && <p>Solicitudes: {r.specialRequests}</p>}
              {r.aiNotes && <p>Notas IA: {r.aiNotes}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}