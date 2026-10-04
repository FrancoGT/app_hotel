// Permiso = ModuleLevel en el backend
export type PermissionType = "r" | "w" | "d" | "a"

export interface Permission {
  id: number
  name: string
  moduleId: number
  moduleOrigin?: string | null
  modulePosition: number
  familyPosition?: number | null
  description?: string | null
  perms: string // Permisos principales
  subperms?: string | null
  type: PermissionType // r=lectura, w=escritura, d=eliminar, a=admin
  bydefault?: string | null
  status?: string | null // "A" (Activo), "I" (Inactivo)
}

// Payload para Crear y Actualizar
export type PermissionPayload = Omit<Permission, "id">
