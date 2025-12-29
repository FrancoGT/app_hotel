"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { useEstablishments } from "@/hooks/useEstablishments"
import { EstablishmentsTable } from "@/components/establishments/EstablishmentsTable"
import { EstablishmentModal } from "@/components/establishments/EstablishmentModal"
import {
  Establishment,
  EstablishmentPayload,
} from "@/lib/types/establishment"
import { AuthGuard, type GuardState } from "@/components/auth/AuthGuard"
import { useAuth } from "@/context/AuthContext"

export default function EstablishmentsAdminPage() {
  const router = useRouter()
  const { isLoggedIn, user } = useAuth()

  const {
    establishments,
    loading,
    error,
    loadEstablishments,
    createEstablishment,
    updateEstablishment,
    deleteEstablishment,
  } = useEstablishments()

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
      void loadEstablishments()
    }
  }, [guardState, loadEstablishments])

  /* ==========================
     UI STATE
  ========================== */
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Establishment | null>(null)
  const [saving, setSaving] = useState(false)

  /* ==========================
     SEARCH + PAGINATION
  ========================== */
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const PAGE_SIZE = 8

  const filteredEstablishments = useMemo(() => {
    if (!search.trim()) return establishments

    const q = search.toLowerCase()

    return establishments.filter((est) =>
      [est.name, est.address, est.city, est.phone]
        .filter(Boolean)
        .some((v) => v!.toLowerCase().includes(q))
    )
  }, [establishments, search])

  const totalPages = Math.ceil(
    filteredEstablishments.length / PAGE_SIZE
  )

  const paginatedEstablishments = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredEstablishments.slice(start, start + PAGE_SIZE)
  }, [filteredEstablishments, page])

  /* ==========================
     CRUD HANDLERS
  ========================== */
  const handleCreate = () => {
    if (guardState !== "ready") return
    setEditing(null)
    setShowModal(true)
  }

  const handleEdit = (est: Establishment) => {
    if (guardState !== "ready") return
    setEditing(est)
    setShowModal(true)
  }

  const handleDelete = async (est: Establishment) => {
    if (guardState !== "ready") return

    if (
      !confirm(
        `¿Seguro que deseas eliminar el establecimiento "${est.name}"?`
      )
    ) {
      return
    }

    try {
      await deleteEstablishment(est.id)
    } catch (e: any) {
      console.error("Error al eliminar establecimiento:", e)
      alert(
        `No se pudo eliminar el establecimiento:\n${
          e?.message ?? "Error desconocido"
        }`
      )
    }
  }

  const handleSubmitForm = async (
    data: EstablishmentPayload
  ) => {
    if (guardState !== "ready") return

    setSaving(true)
    try {
      if (editing) {
        await updateEstablishment(editing.id, data)
      } else {
        await createEstablishment(data)
      }

      setShowModal(false)
      setEditing(null)
    } catch (e: any) {
      console.error("Error al guardar establecimiento:", e)
      alert(
        `Error al guardar:\n${
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
              placeholder="Buscar establecimiento..."
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
              {filteredEstablishments.length} resultados
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
                Cargando establecimientos…
              </div>
            ) : paginatedEstablishments.length === 0 ? (
              <div className="p-6 text-sm text-[var(--color-500)]">
                No se encontraron resultados.
              </div>
            ) : (
              <EstablishmentsTable
                items={paginatedEstablishments}
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

          <EstablishmentModal
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
    <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--dark-color)]">
          Gestionar Establecimientos
        </h1>
        <p className="text-sm text-[var(--color-500)] mt-1">
          Administra los establecimientos disponibles en el sistema.
        </p>
      </div>

      <button
        onClick={onCreate}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl 
                   bg-[var(--primary-color)] text-white text-sm font-medium 
                   hover:brightness-110 transition-all shadow-sm"
      >
        Nuevo establecimiento
      </button>
    </header>
  )
}