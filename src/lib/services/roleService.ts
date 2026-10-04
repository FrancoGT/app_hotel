import { apiFetch, toArray } from "@/lib/http"
import type { Permission } from "@/lib/types/permission"
import type { Role, RolePayload } from "@/lib/types/role"
import type { User } from "@/lib/types/user"

export const roleService = {
  list: async (): Promise<Role[]> => toArray<Role>(await apiFetch("/roles/?limit=1000")),

  getById: (id: number) => apiFetch<Role>(`/roles/${id}`),

  create: (data: RolePayload) => apiFetch<Role>("/roles/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<RolePayload>) =>
    apiFetch<Role>(`/roles/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // El backend no lo borra: lo desactiva
  delete: (id: number) => apiFetch<void>(`/roles/${id}`, { method: "DELETE" }),

  users: async (id: number): Promise<User[]> => toArray<User>(await apiFetch(`/roles/${id}/users`)),

  permissions: async (id: number): Promise<Permission[]> =>
    toArray<Permission>(await apiFetch(`/roles/${id}/permissions`)),

  assignPermission: (id: number, permissionId: number) =>
    apiFetch<unknown>(`/roles/${id}/permissions`, {
      method: "POST",
      body: JSON.stringify({ moduleLevelId: permissionId }),
    }),

  removePermission: (id: number, permissionId: number) =>
    apiFetch<void>(`/roles/${id}/permissions/${permissionId}`, { method: "DELETE" }),
}
