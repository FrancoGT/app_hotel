"use client"

import Image from "next/image"
import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/ui/status-badge"
import { ROOM_STATUS } from "@/lib/constants/status"
import type { Room } from "@/lib/types/room"

const columns: Column<Room>[] = [
  { header: "Nº", cell: (r) => r.id, className: "text-[var(--dark-color)] font-medium" },
  {
    header: "Imagen",
    cell: (r) =>
      r.mainImage ? (
        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-[var(--border-color)]">
          <Image src={r.mainImage} alt={`Habitación ${r.roomNumber}`} fill className="object-cover" sizes="64px" />
        </div>
      ) : (
        <div className="w-16 h-12 rounded-lg border border-dashed border-[var(--border-color)] bg-[var(--body-color)] flex items-center justify-center">
          <span className="text-[10px] text-[var(--color-400)]">Sin imagen</span>
        </div>
      ),
  },
  { header: "Código", cell: (r) => r.roomNumber, className: "text-[var(--dark-color)] font-medium" },
  { header: "Piso", cell: (r) => r.floor },
  {
    header: "Tipo/Desc",
    cell: (r) => <span title={r.description}>{r.description || "-"}</span>,
    className: "max-w-[200px] truncate",
  },
  { header: "Precio", cell: (r) => `S/ ${r.pricePerNight}`, className: "text-[var(--dark-color)] font-medium" },
  { header: "Capacidad", cell: (r) => `${r.maxOccupancy} pers.` },
  { header: "Estado", cell: (r) => <StatusBadge map={ROOM_STATUS} status={r.status || "available"} /> },
]

interface RoomsTableProps {
  items: Room[]
  onEdit: (item: Room) => void
  onDelete: (item: Room) => void
}

export function RoomsTable(props: RoomsTableProps) {
  return <DataTable {...props} columns={columns} entityLabel="habitación" />
}
