"use client"

import type { Room } from "@/lib/types/room"

interface RoomsTableProps {
  items: Room[]
  onEdit: (room: Room) => void
  onDelete: (room: Room) => void
}

export function RoomsTable({ items, onEdit, onDelete }: RoomsTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-color)] bg-[var(--body-color)]/40">
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Nº</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Código</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Piso</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Tipo/Desc</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Precio</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Capacidad</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Estado</th>
            <th className="px-4 py-3 text-right font-semibold text-[var(--color-500)]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((room) => (
            <RoomTableRow key={room.id} room={room} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface RoomTableRowProps {
  room: Room
  onEdit: (room: Room) => void
  onDelete: (room: Room) => void
}

function RoomTableRow({ room, onEdit, onDelete }: RoomTableRowProps) {
  return (
    <tr className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--body-color)]/50 transition-colors">
      <td className="px-4 py-4 text-[var(--dark-color)] font-medium">{room.id}</td>
      <td className="px-4 py-4 text-[var(--dark-color)] font-medium">{room.roomNumber}</td>
      <td className="px-4 py-4 text-[var(--color-600)]">{room.floor}</td>
      <td className="px-4 py-4 text-[var(--color-600)] max-w-[200px] truncate" title={room.description}>
        {room.description || "-"}
      </td>
      <td className="px-4 py-4 text-[var(--dark-color)] font-medium">S/ {room.pricePerNight}</td>
      <td className="px-4 py-4 text-[var(--color-600)]">{room.maxOccupancy} pers.</td>
      <td className="px-4 py-4">
        <RoomStatusBadge status={room.status} />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => onEdit(room)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg 
                       border border-[var(--border-color)] text-[var(--color-600)]
                       hover:border-[var(--dark-color)] hover:text-[var(--dark-color)]
                       hover:bg-[var(--body-color)]/60 transition-all"
            aria-label="Editar habitación"
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
              <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" />
              <path d="m15 5 4 4" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(room)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg 
                       border border-[var(--border-color)] text-[var(--color-600)]
                       hover:border-red-500 hover:text-red-600 hover:bg-red-50
                       transition-all"
            aria-label="Eliminar habitación"
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
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              <path d="M3 6h18" />
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

function RoomStatusBadge({ status }: { status?: string }) {
  const s = status?.toLowerCase() || "available"
  
  let styles = "bg-slate-100 text-slate-600 border-slate-200"
  let label = status

  if (s === "available" || s === "disponible") {
    styles = "bg-emerald-100 text-emerald-700 border-emerald-200"
    label = "Disponible"
  } else if (s === "occupied" || s === "ocupado") {
    styles = "bg-blue-100 text-blue-700 border-blue-200"
    label = "Ocupada"
  } else if (s === "maintenance" || s === "mantenimiento") {
    styles = "bg-orange-100 text-orange-700 border-orange-200"
    label = "Mantenimiento"
  } else if (s === "dirty" || s === "limpieza") {
    styles = "bg-yellow-100 text-yellow-700 border-yellow-200"
    label = "Limpieza"
  }

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${styles}`}>
      {label}
    </span>
  )
}