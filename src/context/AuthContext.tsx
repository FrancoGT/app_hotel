"use client"

import { createContext, useContext, useEffect, useState } from "react"

type UserType = {
  name: string
  email: string
  avatar: string
}

type AuthContextType = {
  isLoggedIn: boolean
  user: UserType | null
  login: (user: UserType, token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")
    const userData = localStorage.getItem("user")
    if (token && userData) {
      const parsed = JSON.parse(userData)
      setUser({
        name: parsed.displayName || "Usuario",
        email: parsed.login || "",
        avatar: "/placeholder.svg?height=32&width=32",
      })
      setIsLoggedIn(true)
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

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)