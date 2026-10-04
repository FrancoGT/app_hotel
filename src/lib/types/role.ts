// Rol = UserGroup en el backend
export interface Role {
  id: number
  name: string
  prefix?: string | null
  officeId?: number | null
  description?: string | null
  level?: number | null
  status?: string | null // "A" (Activo), "I" (Inactivo)
  createdBy?: number | null
  updatedBy?: number | null
  createdAt?: string
  updatedAt?: string
}

// Payload para Crear y Actualizar
export interface RolePayload {
  name: string
  prefix?: string | null
  officeId?: number | null
  description?: string | null
  level?: number | null
  status?: string | null
}

// Relación usuario ↔ rol devuelta al asignar (POST /users/{id}/roles)
export interface UserRoleLink {
  id: number
  userId: number
  userGroupId: number
  status?: string | null
}
