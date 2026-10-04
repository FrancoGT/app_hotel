"use client"

import { useCallback, useEffect, useState } from "react"
import { AssignmentPanel, ReadOnlyList } from "@/components/admin/AssignmentPanel"
import { userService } from "@/lib/services/userService"
import { roleService } from "@/lib/services/roleService"
import { isActiveRecord } from "@/lib/constants/status"
import type { ToastState } from "@/hooks/useToast"
import type { Permission } from "@/lib/types/permission"
import type { Role } from "@/lib/types/role"
import type { User } from "@/lib/types/user"

interface UserRolesManagerProps {
  user: User
  onNotify: (message: string, type?: ToastState["type"]) => void
}

const roleItem = (r: Role) => ({ id: r.id, label: r.name, detail: r.description })
const permissionItem = (p: Permission) => ({ id: p.id, label: p.name, detail: p.description ?? p.perms })

// Asignación de roles a un usuario y vista de sus permisos efectivos
export function UserRolesManager({ user, onNotify }: UserRolesManagerProps) {
  const [allRoles, setAllRoles] = useState<Role[]>([])
  const [userRoles, setUserRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Roles y permisos del usuario; se recargan tras cada cambio
  const refresh = useCallback(async () => {
    const [roles, perms] = await Promise.all([userService.roles(user.id), userService.permissions(user.id)])
    setUserRoles(roles)
    setPermissions(perms)
  }, [user.id])

  useEffect(() => {
    Promise.all([roleService.list().then(setAllRoles), refresh()])
      .catch((e) => {
        console.error(e)
        setError("No se pudieron cargar los roles del usuario.")
      })
      .finally(() => setLoading(false))
  }, [refresh])

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

  if (loading) return <p className="text-sm text-[var(--color-500)]">Cargando roles…</p>
  if (error) return <p className="text-sm text-red-600">{error}</p>

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      <AssignmentPanel
        title="Roles asignados"
        assigned={userRoles.map(roleItem)}
        options={allRoles.filter((r) => isActiveRecord(r.status)).map(roleItem)}
        emptyText="Este usuario no tiene roles asignados."
        addPlaceholder="Selecciona un rol…"
        onAdd={(roleId) => run(() => userService.assignRole(user.id, roleId), "Rol asignado")}
        onRemove={(roleId) => run(() => userService.removeRole(user.id, roleId), "Rol quitado")}
      />
      <ReadOnlyList
        title="Permisos efectivos"
        items={permissions.map(permissionItem)}
        emptyText="Sin permisos: asigna un rol que tenga permisos."
      />
    </div>
  )
}
