"use client"

import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/ui/status-badge"
import { PERMISSION_TYPE_LABELS } from "@/lib/constants/permissions"
import { RECORD_STATUS, isActiveRecord } from "@/lib/constants/status"
import type { Permission } from "@/lib/types/permission"

const columns: Column<Permission>[] = [
  {
    header: "Nombre",
    cell: (p) => (
      <div>
        <p className="text-[var(--dark-color)] font-medium">{p.name}</p>
        {p.description && <p className="text-xs text-[var(--color-500)] max-w-[260px] truncate">{p.description}</p>}
      </div>
    ),
  },
  { header: "Módulo", cell: (p) => `${p.moduleId}${p.moduleOrigin ? ` · ${p.moduleOrigin}` : ""}` },
  {
    header: "Permisos",
    cell: (p) => (
      <code className="text-xs">
        {p.perms}
        {p.subperms ? ` / ${p.subperms}` : ""}
      </code>
    ),
  },
  { header: "Tipo", cell: (p) => PERMISSION_TYPE_LABELS[p.type] ?? p.type },
  {
    header: "Estado",
    cell: (p) => <StatusBadge map={RECORD_STATUS} status={isActiveRecord(p.status) ? "active" : "inactive"} />,
  },
]

interface PermissionsTableProps {
  items: Permission[]
  onEdit: (item: Permission) => void
  onDelete: (item: Permission) => void
}

export function PermissionsTable(props: PermissionsTableProps) {
  return <DataTable {...props} columns={columns} entityLabel="permiso" />
}
