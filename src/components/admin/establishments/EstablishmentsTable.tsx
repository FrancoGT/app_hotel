"use client"

import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/ui/status-badge"
import { RECORD_STATUS, isActiveRecord } from "@/lib/constants/status"
import type { Establishment } from "@/lib/types/establishment"

const columns: Column<Establishment>[] = [
  { header: "Nombre", cell: (e) => e.name, className: "text-[var(--dark-color)] font-medium" },
  { header: "Dirección", cell: (e) => e.address || "-" },
  { header: "Ciudad", cell: (e) => e.city || "-" },
  { header: "Teléfono", cell: (e) => e.phone || "-" },
  {
    header: "Estado",
    cell: (e) => <StatusBadge map={RECORD_STATUS} status={isActiveRecord(e.status) ? "active" : "inactive"} />,
  },
]

interface EstablishmentsTableProps {
  items: Establishment[]
  onEdit: (item: Establishment) => void
  onDelete: (item: Establishment) => void
}

export function EstablishmentsTable(props: EstablishmentsTableProps) {
  return <DataTable {...props} columns={columns} entityLabel="establecimiento" />
}
