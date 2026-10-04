"use client"

import { useCallback, useEffect, useState } from "react"
import { AssignmentPanel, ReadOnlyList } from "@/components/admin/AssignmentPanel"
import { roleService } from "@/lib/services/roleService"
import { permissionService } from "@/lib/services/permissionService"
import { PERMISSION_TYPE_LABELS } from "@/lib/constants/permissions"
import { isActiveRecord } from "@/lib/constants/status"
import type { ToastState } from "@/hooks/useToast"
import type { Permission } from "@/lib/types/permission"
import type { Role } from "@/lib/types/role"
import type { User } from "@/lib/types/user"

interface RolePermissionsManagerProps {
  role: Role
  onNotify: (message: string, type?: ToastState["type"]) => void
}

const permissionItem = (p: Permission) => ({
  id: p.id,
  label: p.name,
  detail: [`Módulo ${p.moduleId}`, PERMISSION_TYPE_LABELS[p.type] ?? p.type, p.description].filter(Boolean).join(" · "),
})

// Asignación de permisos a un rol y lista de los usuarios que lo tienen
export function RolePermissionsManager({ role, onNotify }: RolePermissionsManagerProps) {
  const [allPermissions, setAllPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setRolePermissions(await roleService.permissions(role.id))
  }, [role.id])

  useEffect(() => {
    Promise.all([
      permissionService.list().then(setAllPermissions),
      roleService.users(role.id).then(setUsers),
      refresh(),
    ])
      .catch((e) => {
        console.error(e)
        setError("No se pudieron cargar los permisos del rol.")
      })
      .finally(() => setLoading(false))
  }, [role.id, refresh])

  const run = async (action: () => Promise<unknown>, success: string) => {
    try {
      await action()
      await refresh()
      onNotify(success)
    } catch (e) {
      console.error(e)
      onNotify(e instanceof Error ? e.message : "No se pudo completar la operación", "error")
    }
  }

  if (loading) return <p className="text-sm text-[var(--color-500)]">Cargando permisos…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <AssignmentPanel
        title="Permisos del rol"
        assigned={rolePermissions.map(permissionItem)}
        options={allPermissions.filter((p) => isActiveRecord(p.status)).map(permissionItem)}
        emptyText="Este rol todavía no tiene permisos."
        addPlaceholder="Selecciona un permiso…"
        onAdd={(permissionId) => run(() => roleService.assignPermission(role.id, permissionId), "Permiso asignado")}
        onRemove={(permissionId) => run(() => roleService.removePermission(role.id, permissionId), "Permiso quitado")}
      />
      <ReadOnlyList
        title={`Usuarios con este rol (${users.length})`}
        items={users.map((u) => ({ id: u.id, label: u.displayName || u.login, detail: u.login }))}
        emptyText="Ningún usuario tiene este rol. Asígnalo desde la sección Usuarios."
      />
    </div>
  )
}
