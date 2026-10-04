"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"
import { Toast } from "@/components/ui/toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import type { ToastState } from "@/hooks/useToast"

interface AdminCrudLayoutProps {
  title: string
  description: string
  createLabel: string
  onCreate: () => void
  // Enlace secundario opcional en la cabecera (p. ej. Habitaciones ↔ Tipos)
  secondaryLink?: { href: string; label: string }
  searchPlaceholder: string
  search: string
  onSearchChange: (value: string) => void
  resultCount: number
  error: string | null
  loading: boolean
  loadingText: string
  isEmpty: boolean
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  // La tabla
  children: ReactNode
  // Modal de crear/editar con el formulario
  modal: { isOpen: boolean; title: string; saving: boolean; onClose: () => void; content: ReactNode }
  toast: ToastState | null
  deletion: { message: string | null; confirmLabel?: string; confirm: () => void; cancel: () => void }
}

const PRIMARY_BUTTON =
  "inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[var(--primary-color)] text-white text-sm font-medium hover:brightness-110 transition-all shadow-sm"

// Estructura común de las páginas de gestión: cabecera, buscador, tabla, paginación,
// modal del formulario, notificaciones y confirmación de borrado
export function AdminCrudLayout(props: AdminCrudLayoutProps) {
  const { page, totalPages, onPageChange } = props

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-semibold text-[var(--dark-color)]">{props.title}</h1>
          <p className="text-sm text-[var(--color-500)] mt-1">{props.description}</p>
        </div>
        <div className="flex gap-3">
          {props.secondaryLink && (
            <Link
              href={props.secondaryLink.href}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 border border-slate-200 text-sm font-medium hover:bg-slate-200 transition-all shadow-sm"
            >
              {props.secondaryLink.label}
            </Link>
          )}
          <button onClick={props.onCreate} className={PRIMARY_BUTTON}>
            {props.createLabel}
          </button>
        </div>
      </header>

      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          type="text"
          placeholder={props.searchPlaceholder}
          value={props.search}
          onChange={(e) => props.onSearchChange(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-[var(--border-color)] bg-transparent px-4 py-2 text-sm text-[var(--dark-color)] placeholder:text-[var(--color-500)] focus:outline-none focus:ring-2 focus:ring-[var(--dark-color)]"
        />
        <span className="text-xs text-[var(--color-500)]">{props.resultCount} resultados</span>
      </div>

      {props.error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {props.error}
        </div>
      )}

      <section className="bg-[var(--card-color)] border border-[var(--border-color)] rounded-2xl shadow-sm overflow-hidden">
        {props.loading ? (
          <div className="p-6 text-sm text-[var(--color-500)]">{props.loadingText}</div>
        ) : props.isEmpty ? (
          <div className="p-6 text-sm text-[var(--color-500)]">No se encontraron resultados.</div>
        ) : (
          props.children
        )}
      </section>

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-end gap-2 text-sm">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border border-[var(--border-color)] px-3 py-1 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="px-2 text-[var(--color-600)]">
            Página {page} de {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border border-[var(--border-color)] px-3 py-1 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      {props.modal.isOpen && (
        <Modal title={props.modal.title} onClose={props.modal.onClose} disabled={props.modal.saving}>
          {props.modal.content}
        </Modal>
      )}
      <Toast toast={props.toast} />
      <ConfirmDialog
        message={props.deletion.message}
        confirmLabel={props.deletion.confirmLabel}
        onConfirm={props.deletion.confirm}
        onCancel={props.deletion.cancel}
      />
    </div>
  )
}
