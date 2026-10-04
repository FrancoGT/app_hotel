"use client"

import { ShieldCheck } from "lucide-react"
import { ActionButton, DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/ui/status-badge"
import { RECORD_STATUS, isActiveRecord } from "@/lib/constants/status"
import type { Role } from "@/lib/types/role"

const columns: Column<Role>[] = [
  { header: "Nombre", cell: (r) => r.name, className: "text-[var(--dark-color)] font-medium" },
  { header: "Prefijo", cell: (r) => r.prefix || "-" },
  {
    header: "Descripción",
    cell: (r) => <span title={r.description ?? undefined}>{r.description || "-"}</span>,
    className: "max-w-[240px] truncate",
  },
  { header: "Nivel", cell: (r) => r.level ?? "-" },
  {
    header: "Estado",
    cell: (r) => <StatusBadge map={RECORD_STATUS} status={isActiveRecord(r.status) ? "active" : "inactive"} />,
  },
]

interface RolesTableProps {
  items: Role[]
  onEdit: (item: Role) => void
  onDelete: (item: Role) => void
  onManagePermissions: (item: Role) => void
}

export function RolesTable({ onManagePermissions, ...props }: RolesTableProps) {
  return (
    <DataTable
      {...props}
      columns={columns}
      entityLabel="rol"
      renderActions={(r) => (
        <ActionButton label="Permisos y usuarios" onClick={() => onManagePermissions(r)}>
          <ShieldCheck />
        </ActionButton>
      )}
    />
  )
}
