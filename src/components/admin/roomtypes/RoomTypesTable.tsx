"use client"

import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/ui/status-badge"
import { RECORD_STATUS } from "@/lib/constants/status"
import type { RoomType } from "@/lib/types/room_type"

const columns: Column<RoomType>[] = [
  { header: "Nombre", cell: (t) => t.name, className: "text-[var(--dark-color)] font-medium" },
  {
    header: "Descripción",
    cell: (t) => <span title={t.description}>{t.description || "-"}</span>,
    className: "max-w-[200px] truncate",
  },
  { header: "Precio Base", cell: (t) => `S/ ${t.basePrice}`, className: "text-[var(--dark-color)] font-medium" },
  { header: "Capacidad", cell: (t) => `${t.capacity} pers.` },
  {
    // Para tipos de habitación solo "A" es activo
    header: "Estado",
    cell: (t) => <StatusBadge map={RECORD_STATUS} status={t.status === "A" ? "active" : "inactive"} />,
  },
]

interface RoomTypesTableProps {
  items: RoomType[]
  onEdit: (item: RoomType) => void
  onDelete: (item: RoomType) => void
}

export function RoomTypesTable(props: RoomTypesTableProps) {
  return <DataTable {...props} columns={columns} entityLabel="tipo de habitación" />
}
