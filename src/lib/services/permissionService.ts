import { apiFetch, toArray } from "@/lib/http"
import type { Permission, PermissionPayload } from "@/lib/types/permission"

export const permissionService = {
  list: async (moduleId?: number): Promise<Permission[]> => {
    const query = moduleId != null ? `&moduleId=${moduleId}` : ""
    return toArray<Permission>(await apiFetch(`/permissions/?limit=1000${query}`))
  },

  getById: (id: number) => apiFetch<Permission>(`/permissions/${id}`),

  create: (data: PermissionPayload) =>
    apiFetch<Permission>("/permissions/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: Partial<PermissionPayload>) =>
    apiFetch<Permission>(`/permissions/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // El backend no lo borra: lo desactiva
  delete: (id: number) => apiFetch<void>(`/permissions/${id}`, { method: "DELETE" }),
}
