import { apiFetch } from "@/lib/http"
import type { LoginCredentials } from "@/lib/types/auth"

// Usuario tal como lo maneja el front (user + roles)
export interface CurrentUser {
  id: number
  login: string
  displayName: string
  first_name: string
  last_name: string
  admin: boolean
  employee: boolean
  status: string
  roles: string[]
}

// Usuario crudo que viene dentro de "user"
type ApiUserBody = Omit<CurrentUser, "roles">

interface LoginApiResponse {
  access_token: string
  token_type: string
  user: ApiUserBody
  roles?: string[]
}

export interface LoginSuccess {
  access_token: string
  token_type: string
  user: CurrentUser
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<LoginSuccess> => {
    const data = await apiFetch<LoginApiResponse>("/users/login", {
      method: "POST",
      auth: false,
      body: JSON.stringify(credentials),
    })
    return {
      access_token: data.access_token,
      token_type: data.token_type,
      user: { ...data.user, roles: data.roles ?? [] },
    }
  },

  // /users/me puede devolver { user, roles } o el usuario plano
  me: async (token?: string): Promise<CurrentUser> => {
    const data = await apiFetch<
      { user: ApiUserBody; roles?: string[] } | (ApiUserBody & { roles?: string[] })
    >("/users/me", { token })

    if ("user" in data) return { ...data.user, roles: data.roles ?? [] }
    return { ...data, roles: data.roles ?? [] }
  },

  logout: (token?: string) => apiFetch<void>("/users/logout", { method: "POST", token }),
}
