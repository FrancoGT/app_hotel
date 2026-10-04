"use client"

import { useState } from "react"
import { Plus, X } from "lucide-react"

export interface AssignmentItem {
  id: number
  label: string
  detail?: string | null
}

interface AssignmentPanelProps {
  title: string
  assigned: AssignmentItem[]
  // Todas las opciones; las ya asignadas se excluyen del selector
  options: AssignmentItem[]
  emptyText: string
  addPlaceholder: string
  onAdd: (id: number) => Promise<void>
  onRemove: (id: number) => Promise<void>
}

// Lista de elementos asignados (con quitar) + selector para asignar uno nuevo.
// Se usa para roles de un usuario y permisos de un rol
export function AssignmentPanel({
  title,
  assigned,
  options,
  emptyText,
  addPlaceholder,
  onAdd,
  onRemove,
}: AssignmentPanelProps) {
  const [selected, setSelected] = useState("")
  // id en proceso (agregar o quitar) para deshabilitar botones
  const [busyId, setBusyId] = useState<number | null>(null)

  const assignedIds = new Set(assigned.map((a) => a.id))
  const available = options.filter((o) => !assignedIds.has(o.id))

  const run = async (id: number, action: (id: number) => Promise<void>) => {
    setBusyId(id)
    try {
      await action(id)
    } finally {
      setBusyId(null)
    }
  }

  const handleAdd = async () => {
    if (!selected) return
    await run(Number(selected), onAdd)
    setSelected("")
  }

  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">{title}</h3>

      <div className="flex gap-2">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
        >
          <option value="">{available.length ? addPlaceholder : "No hay más opciones disponibles"}</option>
          {available.map((o) => (
            <option key={o.id} value={o.id}>
              {o.detail ? `${o.label} — ${o.detail}` : o.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selected || busyId !== null}
          className="inline-flex items-center gap-1 rounded-xl bg-[var(--primary-color)] px-4 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-50"
        >
          <Plus className="size-4" />
          Asignar
        </button>
      </div>

      {assigned.length === 0 ? (
        <p className="text-sm text-[var(--color-500)]">{emptyText}</p>
      ) : (
        <ul className="divide-y divide-[var(--border-color)] rounded-xl border border-[var(--border-color)]">
          {assigned.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--dark-color)] truncate">{item.label}</p>
                {item.detail && <p className="text-xs text-[var(--color-500)] truncate">{item.detail}</p>}
              </div>
              <button
                type="button"
                onClick={() => run(item.id, onRemove)}
                disabled={busyId !== null}
                aria-label={`Quitar ${item.label}`}
                title="Quitar"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-[var(--border-color)] text-[var(--color-600)] hover:border-red-500 hover:text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

interface ReadOnlyListProps {
  title: string
  items: AssignmentItem[]
  emptyText: string
}

// Lista informativa (p. ej. permisos efectivos de un usuario o usuarios de un rol)
export function ReadOnlyList({ title, items, emptyText }: ReadOnlyListProps) {
  return (
    <section className="space-y-3">
      <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-500)]">{emptyText}</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li
              key={item.id}
              title={item.detail ?? undefined}
              className="rounded-full border border-[var(--border-color)] bg-slate-50 px-3 py-1 text-xs text-[var(--color-600)]"
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
