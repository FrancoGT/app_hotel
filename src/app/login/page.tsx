"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginUser } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState({ login: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await loginUser(form)
      login(
        {
          name: response.user.displayName,
          email: response.user.login,
          avatar: "/placeholder.svg",
        },
        response.access_token,
      )
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-serif text-[#9F836A] mb-2">Bienvenido de vuelta</h2>
          <p className="text-sm text-gray-600">Ingresa tus credenciales para continuar</p>
        </div>

        <div className="bg-white p-8 border border-gray-200 rounded-xl shadow-lg">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="login" className="block text-sm font-medium text-gray-700">
                Correo Electrónico
              </label>
              <input
                id="login"
                type="text"
                name="login"
                value={form.login}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F836A] focus:border-transparent transition-colors"
                placeholder="tu@email.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9F836A] focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9F836A] hover:bg-[#8A7158] text-white py-3 px-4 font-serif text-base rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500">
            ¿Problemas para acceder?{" "}
            <button className="text-[#9F836A] hover:text-[#8A7158] font-medium transition-colors">
              Contacta soporte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}