import { apiFetch, toArray } from "@/lib/http"
import type { UserOption, UserRegistrationData } from "@/lib/types/user"

export const userService = {
  // Público. El backend espera la contraseña en el campo `pass`
  register: ({ password, ...rest }: UserRegistrationData) =>
    apiFetch<{ id: number }>("/users/register", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ ...rest, pass: password }),
    }),

  // Admin: lista de clientes para asignar reservas
  list: async (): Promise<UserOption[]> => toArray<UserOption>(await apiFetch("/users/")),
}
