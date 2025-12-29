"use client"

import type { RoomType } from "@/lib/types/room_type" // Ajusta la ruta a tu type

interface RoomTypesTableProps {
  items: RoomType[]
  onEdit: (item: RoomType) => void
  onDelete: (item: RoomType) => void
}

export function RoomTypesTable({ items, onEdit, onDelete }: RoomTypesTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-color)] bg-[var(--body-color)]/40">
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Nombre</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Descripción</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Precio Base</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Capacidad</th>
            <th className="px-4 py-3 text-left font-semibold text-[var(--color-500)]">Estado</th>
            <th className="px-4 py-3 text-right font-semibold text-[var(--color-500)]">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((type) => (
            <RoomTypeTableRow key={type.id} item={type} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

interface RoomTypeTableRowProps {
  item: RoomType
  onEdit: (item: RoomType) => void
  onDelete: (item: RoomType) => void
}

function RoomTypeTableRow({ item, onEdit, onDelete }: RoomTypeTableRowProps) {
  return (
    <tr className="border-b border-[var(--border-color)] last:border-0 hover:bg-[var(--body-color)]/50 transition-colors">
      <td className="px-4 py-4 text-[var(--dark-color)] font-medium">{item.name}</td>
      <td className="px-4 py-4 text-[var(--color-600)] max-w-[200px] truncate" title={item.description}>
        {item.description || "-"}
      </td>
      <td className="px-4 py-4 text-[var(--dark-color)] font-medium">S/ {item.basePrice}</td>
      <td className="px-4 py-4 text-[var(--color-600)]">{item.capacity} pers.</td>
      <td className="px-4 py-4">
        <StatusBadge status={item.status} />
      </td>
      <td className="px-4 py-4 text-right">
        <div className="inline-flex items-center gap-2">
          <button
            onClick={() => onEdit(item)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg 
                       border border-[var(--border-color)] text-[var(--color-600)]
                       hover:border-[var(--dark-color)] hover:text-[var(--dark-color)]
                       hover:bg-[var(--body-color)]/60 transition-all"
            aria-label="Editar"
          >
             {/* Icono Edit (mismo que RoomTable) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" /><path d="m15 5 4 4" /></svg>
          </button>
          <button
            onClick={() => onDelete(item)}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg 
                       border border-[var(--border-color)] text-[var(--color-600)]
                       hover:border-red-500 hover:text-red-600 hover:bg-red-50
                       transition-all"
            aria-label="Eliminar"
          >
            {/* Icono Delete (mismo que RoomTable) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 11v6" /><path d="M14 11v6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" /><path d="M3 6h18" /><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
          </button>
        </div>
      </td>
    </tr>
  )
}

function StatusBadge({ status }: { status?: string }) {
  const isActive = status === 'A';
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border ${
      isActive 
        ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
        : "bg-gray-100 text-gray-700 border-gray-200"
    }`}>
      {isActive ? "Activo" : "Inactivo"}
    </span>
  )
}