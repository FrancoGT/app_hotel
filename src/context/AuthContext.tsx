"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import { ApiError, TOKEN_KEY } from "@/lib/http"
import { authService, type CurrentUser } from "@/lib/services/auth"

const USER_KEY = "user"
const ADMIN_ROLE = "Administradores"

export type UserType = {
  name: string
  email: string
  avatar: string
  admin?: boolean
  roles?: string[]
}

type AuthContextType = {
  // true mientras se lee la sesión guardada; los guards no deben decidir antes
  isLoading: boolean
  isLoggedIn: boolean
  user: UserType | null
  isAdmin: boolean
  login: (user: CurrentUser, token: string) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function toUserType(me: CurrentUser): UserType {
  return {
    name: me.displayName || me.login || "Usuario",
    email: me.login,
    avatar: "/placeholder.svg?height=32&width=32",
    admin: me.admin,
    roles: me.roles,
  }
}

function readStoredUser(): UserType | null {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? (JSON.parse(raw) as UserType) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const saveSession = useCallback((nextUser: UserType, token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
  }, [])

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  // Restaura la sesión guardada y la valida contra /users/me (roles actualizados)
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) {
      setIsLoading(false)
      return
    }

    const stored = readStoredUser()
    if (stored) {
      setUser(stored)
      setIsLoading(false)
    }

    authService
      .me(token)
      .then((me) => saveSession(toUserType(me), token))
      .catch((error) => {
        // Solo cerramos sesión si el token ya no es válido; un fallo de red conserva la sesión guardada
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession()
        } else {
          console.error("No se pudo validar la sesión:", error)
        }
      })
      .finally(() => setIsLoading(false))
  }, [saveSession, clearSession])

  const login = useCallback(
    (me: CurrentUser, token: string) => saveSession(toUserType(me), token),
    [saveSession]
  )

  const logout = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      // Si el backend falla, igual cerramos la sesión local
      await authService.logout(token).catch((err) => console.error("Error al cerrar sesión:", err))
    }
    clearSession()
  }, [clearSession])

  const isAdmin = !!user?.admin || (user?.roles?.includes(ADMIN_ROLE) ?? false)

  return (
    <AuthContext.Provider value={{ isLoading, isLoggedIn: !!user, user, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>")
  return ctx
}
