"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { loginUser } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { parseServerError } from "@/lib/error-parser"

interface FormData {
  login: string
  password: string
}

interface FieldErrors {
  login?: string
  password?: string
}

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [form, setForm] = useState<FormData>({ login: "", password: "" })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // 1) Tipar el validador por clave conocida
  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case "login":
        if (!value.trim()) return "El correo electrónico es requerido"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ingresa un correo electrónico válido"
        return undefined
      case "password":
        if (!value) return "La contraseña es requerida"
        if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres"
        return undefined
      default:
        return undefined
    }
  }

  // 2) handleChange con clave tipada
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const key = name as keyof FormData
    setForm((prev) => ({ ...prev, [key]: value }))

    if (fieldErrors[key]) setFieldErrors((prev) => ({ ...prev, [key]: undefined }))
    if (error) setError("")
  }

  // 3) handleBlur con clave tipada
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const key = name as keyof FormData
    const fieldError = validateField(key, value)
    if (fieldError) setFieldErrors((prev) => ({ ...prev, [key]: fieldError }))
  }

  // 4) validateForm sin Object.keys (evita el cast)
  const validateForm = (): boolean => {
    const errors: FieldErrors = {}
    let isValid = true

    const KEYS: (keyof FormData)[] = ["login", "password"]
    for (const key of KEYS) {
      const val = key === "login" ? form[key].trim() : form[key] // normaliza login
      const err = validateField(key, val)
      if (err) {
        errors[key] = err
        isValid = false
      }
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setFieldErrors({})

    if (!validateForm()) {
      setError("Por favor, corrige los errores en el formulario")
      return
    }

    setLoading(true)
    try {
      // loginUser (de lib/auth) devuelve: { access_token, token_type, user: CurrentUser }
      const response = await loginUser(form)

      // response.user es CurrentUser (id, login, displayName, admin, employee, status, roles)
      login(
        {
          name: response.user.displayName || response.user.login || "Usuario",
          email: response.user.login || form.login,
          avatar: "/placeholder.svg?height=32&width=32",
          admin: response.user.admin,       // 👈 importante para /admin
          roles: response.user.roles,       // 👈 por si quieres usar roles también
        },
        response.access_token,
      )

      router.push("/")
    } catch (err: any) {
      const { generalError, fieldErrors: serverFieldErrors } = parseServerError(err)
      if (serverFieldErrors && Object.keys(serverFieldErrors).length > 0) {
        setFieldErrors(serverFieldErrors)
      }
      setError(generalError || err?.message || "Error al iniciar sesión. Intenta nuevamente")
    } finally {
      setLoading(false)
    }
  }

  const getFieldClassName = (fieldName: keyof FieldErrors) => {
    const baseClass =
      "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
    return fieldErrors[fieldName]
      ? `${baseClass} border-red-300 focus:ring-red-200 focus:border-red-500`
      : `${baseClass} border-gray-300 focus:ring-[#9F836A] focus:border-[#9F836A]`
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
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                id="login"
                type="email"
                name="login"
                value={form.login}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("login")}
                placeholder="tu@email.com"
                autoComplete="email"
              />
              {fieldErrors.login && <p className="text-red-500 text-xs mt-1">{fieldErrors.login}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={getFieldClassName("password")}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
            </div>

            <Button
              type="submit"
              disabled={loading || Object.values(fieldErrors).some(Boolean)}
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
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Ingresando...
                </span>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => router.push("/forgot-password")}
              className="text-sm text-[#9F836A] hover:text-[#8A7158] font-medium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            ¿No tienes una cuenta?{" "}
            <button
              onClick={() => router.push("/register")}
              className="text-[#9F836A] hover:text-[#8A7158] font-medium transition-colors"
            >
              Regístrate aquí
            </button>
          </p>

          <p className="text-sm text-gray-500">
            ¿Problemas para acceder?{" "}
            <button
              onClick={() => router.push("/support")}
              className="text-[#9F836A] hover:text-[#8A7158] font-medium transition-colors"
            >
              Contacta soporte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
