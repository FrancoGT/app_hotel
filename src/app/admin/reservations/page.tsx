"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

// Hooks y Componentes de Reservas
import { useReservations } from "@/hooks/useReservations"
import { ReservationsTable } from "@/components/reservations/ReservationsTable"
import { ReservationModal } from "@/components/reservations/ReservationModal"

// Tipos
import {
  Reservation,
  ReservationAdmin,
  ReservationPayload,
  ReservationUpdatePayload,
} from "@/lib/types/reservation"

// Auth
import { AuthGuard, type GuardState } from "@/components/auth/AuthGuard"
import { useAuth } from "@/context/AuthContext"

type AnyReservation = Reservation | ReservationAdmin

export default function ReservationsAdminPage() {
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()

  const {
    reservations,
    loading,
    error,
    loadAllReservations,
    createReservation,
    updateReservation,
    deleteReservation,
  } = useReservations()

  /* ==========================
     AUTH GUARD
  ========================== */
  const [guardState, setGuardState] = useState<GuardState>("loading")

  useEffect(() => {
    if (user === undefined) {
      setGuardState("loading")
      return
    }

    if (!isLoggedIn || !user) {
      setGuardState("unauthenticated")
      return
    }

    const isAdmin =
      user.admin === true ||
      (Array.isArray(user.roles) &&
        user.roles.includes("Administradores"))

    setGuardState(isAdmin ? "ready" : "unauthorized")
  }, [isLoggedIn, user])

  useEffect(() => {
    if (guardState === "ready") {
      void loadAllReservations()
    }
  }, [guardState, loadAllReservations])

  /* ==========================
     UI STATE CRUD
  ========================== */
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<AnyReservation | null>(null)
  const [saving, setSaving] = useState(false)

  /* ==========================
     SEARCH + PAGINATION
  ========================== */
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 8

  // 🔴 FILTRO SEGURO PARA UNION TYPES
  const filteredReservations = useMemo(() => {
    if (!search.trim()) return reservations

    const q = search.toLowerCase()

    return reservations.filter((res) => {
      const statusLabel =
        (res as any)?.status === "A" ||
        (res as any)?.status === "1" ||
        !(res as any)?.status
          ? "activo"
          : "inactivo"

      return [
        res.id?.toString(),
        (res as any)?.status?.toString(),
        statusLabel,
        (res as any)?.checkIn?.toString(),
        (res as any)?.checkOut?.toString(),
        (res as any)?.createdAt?.toString(),
      ]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    })
  }, [reservations, search])

  const totalPages = Math.ceil(filteredReservations.length / PAGE_SIZE)

  const paginatedReservations = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredReservations.slice(start, start + PAGE_SIZE)
  }, [filteredReservations, page])

  /* ==========================
     CRUD HANDLERS
  ========================== */
  const handleCreate = () => {
    if (guardState !== "ready") return
    setEditing(null)
    setShowModal(true)
  }

  const handleEdit = (res: AnyReservation) => {
    if (guardState !== "ready") return
    setEditing(res)
    setShowModal(true)
  }

  const handleDelete = async (res: AnyReservation) => {
    if (guardState !== "ready") return
    if (!confirm(`¿Seguro que deseas cancelar/eliminar la reserva #${res.id}?`))
      return

    try {
      await deleteReservation(res.id)
      await loadAllReservations()
    } catch (e: any) {
      console.error("Error al eliminar reserva:", e)
      alert("No se pudo eliminar la reserva.")
    }
  }

  const handleSubmitForm = async (data: any) => {
    if (guardState !== "ready") return

    setSaving(true)
    try {
      if (editing) {
        await updateReservation(
          editing.id,
          data as ReservationUpdatePayload
        )
      } else {
        await createReservation(data as ReservationPayload)
      }

      setShowModal(false)
      setEditing(null)
      await loadAllReservations()
    } catch (e: any) {
      console.error("Error al guardar reserva:", e)
      alert(
        `Error al guardar: ${
          typeof e?.message === "string"
            ? e.message
            : "Error desconocido"
        }`
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCloseModal = () => {
    if (!saving) {
      setShowModal(false)
      setEditing(null)
    }
  }

  /* ==========================
     RENDER
  ========================== */
  return (
    <AuthGuard
      state={guardState}
      onLoginRedirect={() => router.push("/login")}
      onHomeRedirect={() => router.push("/")}
    >
      <div className="min-h-screen bg-[var(--body-color)]">
        <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
          <PageHeader onCreate={handleCreate} />

          {/* BUSCADOR */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Buscar reserva ..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="w-full max-w-sm rounded-xl border border-[var(--border-color)]
                         bg-transparent px-4 py-2 text-sm
                         text-[var(--dark-color)]
                         placeholder:text-[var(--color-500)]
                         focus:outline-none focus:ring-2 focus:ring-[var(--dark-color)]"
            />

            <span className="text-xs text-[var(--color-500)]">
              {filteredReservations.length} resultados
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 flex justify-center items-center gap-3 text-sm text-[var(--color-500)]">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                Sincronizando tabla...
              </div>
            ) : paginatedReservations.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-500)]">
                No se encontraron resultados.
              </div>
            ) : (
              <ReservationsTable
                items={paginatedReservations}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </section>

          {/* PAGINACIÓN */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-end gap-2 text-sm">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-lg border border-[var(--border-color)]
                           px-3 py-1 disabled:opacity-40"
              >
                Anterior
              </button>

              <span className="px-2 text-[var(--color-600)]">
                Página {page} de {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[var(--border-color)]
                           px-3 py-1 disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          )}

          <ReservationModal
            isOpen={showModal}
            editing={editing}
            onClose={handleCloseModal}
            onSubmit={handleSubmitForm}
            isSaving={saving}
          />
        </div>
      </div>
    </AuthGuard>
  )
}

/* ==========================
   HEADER
========================== */
interface PageHeaderProps {
  onCreate: () => void
}

function PageHeader({ onCreate }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--dark-color)]">
          Gestionar Reservaciones
        </h1>
        <p className="text-sm text-[var(--color-500)] mt-1">
          Visualiza, edita o crea reservas para tus clientes.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl 
                   bg-[var(--primary-color)] text-white text-sm font-medium 
                   hover:brightness-110 transition-all shadow-sm"
      >
        Nueva reserva
      </button>
    </header>
  )
}