// src/context/AuthContext.tsx
"use client"

import { createContext, useContext, useEffect, useState } from "react"

export type UserType = {
  name: string
  email: string
  avatar: string
  admin?: boolean
  roles?: string[]
}

type AuthContextType = {
  isLoggedIn: boolean
  user: UserType | null
  login: (user: UserType, token: string) => void
  logout: () => void
  isAdmin: () => boolean
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
  isAdmin: () => false,
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return

    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData) as UserType
        setUser(parsed)          // 👈 usamos lo que tú guardaste
        setIsLoggedIn(true)
      } catch (e) {
        console.error("Error al parsear usuario desde localStorage", e)
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
      }
    }
  }, [])

  const login = (userData: UserType, token: string) => {
    localStorage.setItem("access_token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)
    setIsLoggedIn(true)
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    localStorage.removeItem("user")
    setUser(null)
    setIsLoggedIn(false)
  }

  const isAdmin = () => {
    return !!user?.admin || (user?.roles?.includes("Administradores") ?? false)
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
