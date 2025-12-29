"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

// Hooks y Componentes de Rooms
import { useRooms } from "@/hooks/useRooms"
import { RoomsTable } from "@/components/rooms/RoomsTable"
import { RoomModal } from "@/components/rooms/RoomModal"
import { Room, RoomPayload } from "@/lib/types/room"

// Auth y Shared
import { AuthGuard, type GuardState } from "@/components/auth/AuthGuard"
import { useAuth } from "@/context/AuthContext"

export default function RoomsAdminPage() {
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()

  const {
    rooms,
    loading,
    error,
    loadRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  } = useRooms()

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
      void loadRooms()
    }
  }, [guardState, loadRooms])

  /* ==========================
     UI STATE CRUD
  ========================== */
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Room | null>(null)
  const [saving, setSaving] = useState(false)

  /* ==========================
     SEARCH + PAGINATION
  ========================== */
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 8

  // 🔴 CORREGIDO: solo campos que existen en Room
  const filteredRooms = useMemo(() => {
    if (!search.trim()) return rooms

    const q = search.toLowerCase()

    return rooms.filter((room) => {
      const statusLabel =
        !room.status ||
        room.status.toUpperCase() === "A" ||
        room.status === "1"
          ? "activo"
          : "inactivo"

      return [
        room.roomNumber?.toString(),
        room.floor?.toString(),
        room.roomTypeId?.toString(), // ✅ existe
        room.status?.toString(),
        statusLabel, // permite buscar "activo / inactivo"
      ]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    })
  }, [rooms, search])

  const totalPages = Math.ceil(filteredRooms.length / PAGE_SIZE)

  const paginatedRooms = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredRooms.slice(start, start + PAGE_SIZE)
  }, [filteredRooms, page])

  /* ==========================
     CRUD HANDLERS
  ========================== */
  const handleCreate = () => {
    if (guardState !== "ready") return
    setEditing(null)
    setShowModal(true)
  }

  const handleEdit = (room: Room) => {
    if (guardState !== "ready") return
    setEditing(room)
    setShowModal(true)
  }

  const handleDelete = async (room: Room) => {
    if (guardState !== "ready") return

    if (
      !confirm(
        `¿Seguro que deseas eliminar la habitación "${room.roomNumber}"?`
      )
    ) {
      return
    }

    try {
      await deleteRoom(room.id)
    } catch (e: any) {
      console.error("Error al eliminar habitación:", e)
      alert(
        `No se pudo eliminar la habitación:\n${
          e?.message ?? "Error desconocido"
        }`
      )
    }
  }

  const handleSubmitForm = async (data: RoomPayload) => {
    if (guardState !== "ready") return

    setSaving(true)
    try {
      if (editing) {
        await updateRoom(editing.id, data)
      } else {
        await createRoom(data)
      }

      setShowModal(false)
      setEditing(null)
    } catch (e: any) {
      console.error("Error al guardar habitación:", e)
      alert(
        `Error al guardar la habitación:\n${
          e?.message ?? "Error desconocido"
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
              placeholder="Buscar habitación..."
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
              {filteredRooms.length} resultados
            </span>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <section className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl shadow-sm">
            {loading ? (
              <div className="p-6 text-sm text-[var(--color-500)]">
                Cargando habitaciones…
              </div>
            ) : paginatedRooms.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-500)]">
                No se encontraron resultados.
              </div>
            ) : (
              <RoomsTable
                items={paginatedRooms}
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

          <RoomModal
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
  const router = useRouter()

  return (
    <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--dark-color)]">
          Gestionar Habitaciones
        </h1>
        <p className="text-sm text-[var(--color-500)] mt-1">
          Administra las habitaciones del hotel y su disponibilidad.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/admin/roomtypes")}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl 
                     bg-slate-100 text-slate-600 border border-slate-200 text-sm font-medium 
                     hover:bg-slate-200 transition-all shadow-sm"
        >
          Ver Tipos
        </button>

        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl 
                     bg-[var(--primary-color)] text-white text-sm font-medium 
                     hover:brightness-110 transition-all shadow-sm"
        >
          Nueva habitación
        </button>
      </div>
    </header>
  )
}