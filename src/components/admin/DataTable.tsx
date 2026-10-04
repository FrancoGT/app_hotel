"use client"

import type { ReactNode } from "react"
import { Pencil, Trash2 } from "lucide-react"
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
  // Sin onDelete no se muestra el botón de eliminar
  onDelete?: (item: T) => void
  // Botones adicionales antes de Editar (usar <ActionButton>)
  renderActions?: (item: T) => ReactNode
  // Texto accesible de los botones de acción, p. ej. "habitación"
  entityLabel: string
}

// Tabla del panel admin con columna de acciones Editar/Eliminar
export function DataTable<T extends { id: number }>({
  items,
  columns,
  onEdit,
  onDelete,
  renderActions,
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
                  {renderActions?.(item)}
                  <ActionButton label={`Editar ${entityLabel}`} onClick={() => onEdit(item)}>
                    <Pencil />
                  </ActionButton>
                  {onDelete && (
                    <ActionButton label={`Eliminar ${entityLabel}`} onClick={() => onDelete(item)} danger>
                      <Trash2 />
                    </ActionButton>
                  )}
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
  // Icono de lucide-react; se ajusta a 16px
  children: ReactNode
}

export function ActionButton({ label, onClick, danger, children }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex items-center justify-center w-9 h-9 rounded-lg border border-[var(--border-color)] text-[var(--color-600)] transition-all [&_svg]:size-4",
        danger
          ? "hover:border-red-500 hover:text-red-600 hover:bg-red-50"
          : "hover:border-[var(--dark-color)] hover:text-[var(--dark-color)] hover:bg-[var(--body-color)]/60"
      )}
    >
      {children}
    </button>
  )
}
