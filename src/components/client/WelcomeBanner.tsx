"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"

const VISIBLE_MS = 5000

// Saludo temporal en la parte superior: bienvenida al cliente o invitación a iniciar sesión
export function WelcomeBanner() {
  const { isLoading, user } = useAuth()
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), VISIBLE_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!visible || isLoading) return null

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[55] w-full max-w-md px-4">
      {user ? (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl shadow-lg backdrop-blur-sm text-center">
          <p className="text-lg font-medium">
            ¡Bienvenido(a), <span className="font-bold">{user.name}</span>!
          </p>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl shadow-lg backdrop-blur-sm text-center">
          <p>
            ¡Hola! Para solicitar alguna reserva debes <strong>iniciar sesión</strong> o <strong>registrarte</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
