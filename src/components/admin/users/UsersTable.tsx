"use client"

import { KeyRound, Power } from "lucide-react"
import { ActionButton, DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/ui/status-badge"
import { RECORD_STATUS, isActiveRecord } from "@/lib/constants/status"
import type { User } from "@/lib/types/user"

export const fullName = (u: User) => [u.first_name, u.last_name].filter(Boolean).join(" ")

const columns: Column<User>[] = [
  {
    header: "Usuario",
    cell: (u) => (
      <div>
        <p className="text-[var(--dark-color)] font-medium">{u.displayName || fullName(u) || u.login}</p>
        <p className="text-xs text-[var(--color-500)]">{u.login}</p>
      </div>
    ),
  },
  { header: "Nombre", cell: (u) => fullName(u) || "-" },
  { header: "Teléfono", cell: (u) => u.telephone || "-" },
  { header: "Tipo", cell: (u) => (u.admin ? "Administrador" : u.employee ? "Empleado" : "Cliente") },
  {
    header: "Estado",
    cell: (u) => <StatusBadge map={RECORD_STATUS} status={isActiveRecord(u.status) ? "active" : "inactive"} />,
  },
]

interface UsersTableProps {
  items: User[]
  onEdit: (item: User) => void
  onManageRoles: (item: User) => void
  onToggleStatus: (item: User) => void
}

// Los usuarios no se eliminan: se activan o desactivan
export function UsersTable({ items, onEdit, onManageRoles, onToggleStatus }: UsersTableProps) {
  return (
    <DataTable
      items={items}
      columns={columns}
      onEdit={onEdit}
      entityLabel="usuario"
      renderActions={(u) => (
        <>
          <ActionButton label="Roles y permisos" onClick={() => onManageRoles(u)}>
            <KeyRound />
          </ActionButton>
          <ActionButton
            label={isActiveRecord(u.status) ? "Desactivar usuario" : "Activar usuario"}
            onClick={() => onToggleStatus(u)}
            danger={isActiveRecord(u.status)}
          >
            <Power />
          </ActionButton>
        </>
      )}
    />
  )
}
