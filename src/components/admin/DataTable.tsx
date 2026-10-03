"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export interface Column<T> {
  header: string
  cell: (item: T) => ReactNode
  className?: string
}

interface DataTableProps<T extends { id: number }> {
  items: T[]
  columns: Column<T>[]
  onEdit: (item: T) => void
  onDelete: (item: T) => void
  // Texto accesible de los botones de acción, p. ej. "habitación"
  entityLabel: string
}

// Tabla del panel admin con columna de acciones Editar/Eliminar
export function DataTable<T extends { id: number }>({
  items,
  columns,
  onEdit,
  onDelete,
  entityLabel,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-color)] bg-[var(--body-color)]/40">
            {columns.map((col) => (
              <th key={col.header} className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">
                {col.header}
              </th>
            ))}
            <th className="px-4 py-3 text-right font-semibold text-[var(--color-500)]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--body-color)]/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.header} className={cn("px-4 py-4 text-[var(--color-600)]", col.className)}>
                  {col.cell(item)}
                </td>
              ))}
              <td className="px-4 py-4 text-right">
                <div className="inline-flex items-center gap-2">
                  <ActionButton label={`Editar ${entityLabel}`} onClick={() => onEdit(item)}>
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
                    <path d="m15 5 4 4" />
                  </ActionButton>
                  <ActionButton label={`Eliminar ${entityLabel}`} onClick={() => onDelete(item)} danger>
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </ActionButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface ActionButtonProps {
  label: string
  onClick: () => void
  danger?: boolean
  children: ReactNode
}

function ActionButton({ label, onClick, danger, children }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border-color)] text-[var(--color-600)] transition-all",
        danger
          ? "hover:border-red-500 hover:text-red-600 hover:bg-red-50"
          : "hover:border-[var(--dark-color)] hover:text-[var(--dark-color)] hover:bg-[var(--body-color)]/60"
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {children}
      </svg>
    </button>
  )
}
