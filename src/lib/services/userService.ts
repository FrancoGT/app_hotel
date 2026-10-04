import { apiFetch, toArray } from "@/lib/http"
import type { Permission } from "@/lib/types/permission"
import type { Role, UserRoleLink } from "@/lib/types/role"
import type { User, UserAdminPayload, UserAdminUpdatePayload, UserRegistrationData } from "@/lib/types/user"

// El backend pagina con skip/limit (100 por defecto); el panel filtra y pagina en memoria
const ALL = "?limit=1000"

export const userService = {
  // Público. El backend espera la contraseña en el campo `pass`
  register: ({ password, ...rest }: UserRegistrationData) =>
    apiFetch<{ id: number }>("/users/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ ...rest, pass: password }),
    }),

  // Admin: también se usa para asignar clientes en el formulario de reservas
  list: async (): Promise<User[]> => toArray<User>(await apiFetch(`/users/${ALL}`)),

  getById: (id: number) => apiFetch<User>(`/users/${id}`),

  create: (data: UserAdminPayload) =>
    apiFetch<User>("/users/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: UserAdminUpdatePayload) =>
    apiFetch<User>(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  // El backend no elimina usuarios: se activan ("A") o desactivan ("I")
  setStatus: (id: number, status: "A" | "I") =>
    apiFetch<User>(`/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),

  roles: async (id: number): Promise<Role[]> => toArray<Role>(await apiFetch(`/users/${id}/roles`)),

  assignRole: (id: number, roleId: number) =>
    apiFetch<UserRoleLink>(`/users/${id}/roles`, {
      method: "POST",
      body: JSON.stringify({ userGroupId: roleId }),
    }),

  removeRole: (id: number, roleId: number) =>
    apiFetch<void>(`/users/${id}/roles/${roleId}`, { method: "DELETE" }),

  // Permisos efectivos (la suma de los permisos de sus roles)
  permissions: async (id: number): Promise<Permission[]> =>
    toArray<Permission>(await apiFetch(`/users/${id}/permissions`)),
}
