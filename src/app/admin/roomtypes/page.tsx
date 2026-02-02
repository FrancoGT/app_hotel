"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

// Hooks y Componentes de RoomTypes
import { useRoomTypes } from "@/hooks/useRoomTypes"
import { RoomTypesTable } from "@/components/roomtypes/RoomTypeTable"
import { RoomTypeModal } from "@/components/roomtypes/RoomTypeModal"
import { RoomType, RoomTypePayload } from "@/lib/types/room_type"

// Auth y Shared
import { AuthGuard, type GuardState } from "@/components/auth/AuthGuard"
import { useAuth } from "@/context/AuthContext"

export default function RoomTypesAdminPage() {
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()

  const {
    roomTypes,
    loading,
    error,
    loadRoomTypes,
    createRoomType,
    updateRoomType,
    deleteRoomType,
  } = useRoomTypes()

  /* ==========================
     TOAST STATE (Agregado)
  ========================== */
  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: "success" | "error" | "warning"
  }>({
    show: false,
    message: "",
    type: "success",
  })

  const showToast = (
    message: string,
    type: "success" | "error" | "warning" = "success"
  ) => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" })
    }, 3000)
  }

  /* ==========================
     CONFIRM DIALOG STATE (Agregado)
  ========================== */
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean
    message: string
    onConfirm: () => void
  }>({
    show: false,
    message: "",
    onConfirm: () => {},
  })

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
      (Array.isArray(user.roles) && user.roles.includes("Administradores"))

    setGuardState(isAdmin ? "ready" : "unauthorized")
  }, [isLoggedIn, user])

  useEffect(() => {
    if (guardState === "ready") {
      void loadRoomTypes()
    }
  }, [guardState, loadRoomTypes])

  /* ==========================
     UI STATE CRUD
  ========================== */
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<RoomType | null>(null)
  const [saving, setSaving] = useState(false)

  /* ==========================
     SEARCH + PAGINATION
  ========================== */
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 8

  const filteredRoomTypes = useMemo(() => {
    if (!search.trim()) return roomTypes
    const q = search.toLowerCase()
    return roomTypes.filter((rt) =>
      [rt.name, rt.description]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    )
  }, [roomTypes, search])

  const totalPages = Math.ceil(filteredRoomTypes.length / PAGE_SIZE)

  const paginatedRoomTypes = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredRoomTypes.slice(start, start + PAGE_SIZE)
  }, [filteredRoomTypes, page])

  /* ==========================
     CRUD HANDLERS (Actualizados)
  ========================== */
  const handleCreate = () => {
    if (guardState !== "ready") return
    setEditing(null)
    setShowModal(true)
  }

  const handleEdit = (item: RoomType) => {
    if (guardState !== "ready") return
    setEditing(item)
    setShowModal(true)
  }

  const handleDelete = async (item: RoomType) => {
    if (guardState !== "ready") return

    setConfirmDialog({
      show: true,
      message: `¿Seguro que deseas eliminar el tipo de habitación "${item.name}"?`,
      onConfirm: async () => {
        try {
          await deleteRoomType(item.id)
          showToast("Tipo de habitación eliminado exitosamente", "success")
        } catch (e: any) {
          console.error("Error al eliminar tipo:", e)
          showToast(e?.message ?? "No se pudo eliminar el registro", "error")
        } finally {
          setConfirmDialog({ show: false, message: "", onConfirm: () => {} })
        }
      },
    })
  }

  const handleSubmitForm = async (data: RoomTypePayload) => {
    if (guardState !== "ready") return

    setSaving(true)
    try {
      if (editing) {
        await updateRoomType(editing.id, data)
        showToast("Tipo actualizado exitosamente", "success")
      } else {
        await createRoomType(data)
        showToast("Tipo creado exitosamente", "success")
      }
      setShowModal(false)
      setEditing(null)
    } catch (e: any) {
      console.error("Error al guardar tipo:", e)
      showToast(e?.message ?? "Error al guardar el tipo de habitación", "error")
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
              placeholder="Buscar tipo de habitación..."
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
              {filteredRoomTypes.length} resultados
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
                Cargando tipos de habitación…
              </div>
            ) : paginatedRoomTypes.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-500)]">
                No se encontraron resultados.
              </div>
            ) : (
              <RoomTypesTable
                items={paginatedRoomTypes}
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

          <RoomTypeModal
            isOpen={showModal}
            editing={editing}
            onClose={handleCloseModal}
            onSubmit={handleSubmitForm}
            isSaving={saving}
          />

          {/* TOAST NOTIFICATION */}
          {toast.show && (
            <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[55] w-full max-w-md mx-4 transition-all duration-500 ease-in-out">
              <div
                className={`${
                  toast.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : toast.type === "error"
                    ? "bg-red-50 border-red-200 text-red-800"
                    : "bg-yellow-50 border-yellow-200 text-yellow-800"
                } border p-4 rounded-xl shadow-lg backdrop-blur-sm text-center`}
              >
                <p className="text-sm font-medium">{toast.message}</p>
              </div>
            </div>
          )}

          {/* CONFIRM DIALOG */}
          {confirmDialog.show && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Confirmar acción
                </h3>
                <p className="text-gray-600 mb-6">{confirmDialog.message}</p>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() =>
                      setConfirmDialog({
                        show: false,
                        message: "",
                        onConfirm: () => {},
                      })
                    }
                    className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 
                               hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDialog.onConfirm}
                    className="px-4 py-2 rounded-xl bg-red-500 text-white 
                               hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          )}
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
          Tipos de Habitación
        </h1>
        <p className="text-sm text-[var(--color-500)] mt-1">
          Configura las categorías, precios base y amenidades del hotel.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => router.push("/admin/rooms")}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl 
                     bg-slate-100 text-slate-600 border border-slate-200 text-sm font-medium 
                     hover:bg-slate-200 transition-all shadow-sm"
        >
          Ver Habitaciones
        </button>

        <button
          onClick={onCreate}
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl 
                     bg-[var(--primary-color)] text-white text-sm font-medium 
                     hover:brightness-110 transition-all shadow-sm"
        >
          Nuevo Tipo
        </button>
      </div>
    </header>
  )
}