"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from 'next/navigation'
import { registerUser } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"

interface FormData {
  first_name: string
  last_name: string
  id_document_type: "DNI" | "CE"
  id_document_number: string
  login: string
  pass: string
  telephone: string
  username: string
  position: string
}

interface FieldErrors {
  first_name?: string
  last_name?: string
  id_document_number?: string
  login?: string
  pass?: string
  telephone?: string
  username?: string
}

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({
    first_name: "",
    last_name: "",
    id_document_type: "DNI",
    id_document_number: "",
    login: "",
    pass: "",
    telephone: "",
    username: "",
    position: "Cliente",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Validaciones específicas por campo
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "first_name":
        if (!value.trim()) return "El nombre es requerido"
        if (value.trim().length < 2) return "El nombre debe tener al menos 2 caracteres"
        return undefined

      case "last_name":
        if (!value.trim()) return "Los apellidos son requeridos"
        if (value.trim().length < 2) return "Los apellidos deben tener al menos 2 caracteres"
        return undefined

      case "id_document_number":
        if (!value.trim()) return "El número de documento es requerido"
        if (form.id_document_type === "DNI" && !/^\d{8}$/.test(value)) {
          return "El DNI debe tener 8 dígitos"
        }
        if (form.id_document_type === "CE" && value.length < 9) {
          return "El CE debe tener al menos 9 caracteres"
        }
        return undefined

      case "login":
        if (!value.trim()) return "El correo electrónico es requerido"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Ingresa un correo electrónico válido"
        }
        return undefined

      case "pass":
        if (!value) return "La contraseña es requerida"
        if (value.length < 6) return "La contraseña debe tener al menos 6 caracteres"
        if (!/(?=.*[a-z])(?=.*[A-Z])/.test(value)) {
          return "La contraseña debe tener al menos una mayúscula y una minúscula"
        }
        return undefined

      case "telephone":
        if (!value.trim()) return "El teléfono es requerido"
        if (!/^\d{9}$/.test(value.replace(/\s/g, ""))) {
          return "El teléfono debe tener 9 dígitos"
        }
        return undefined

      case "username":
        if (!value.trim()) return "El nombre de usuario es requerido"
        if (value.length < 3) return "El nombre de usuario debe tener al menos 3 caracteres"
        if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          return "Solo se permiten letras, números y guiones bajos"
        }
        return undefined

      default:
        return undefined
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    // Validar en tiempo real para algunos campos críticos
    if (name === "login" || name === "pass") {
      const fieldError = validateField(name, value)
      if (fieldError) {
        setFieldErrors((prev) => ({ ...prev, [name]: fieldError }))
      }
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldError = validateField(name, value)
    setFieldErrors((prev) => ({ ...prev, [name]: fieldError }))
  }

  const validateForm = (): boolean => {
    const errors: FieldErrors = {}
    let isValid = true

    // Validar todos los campos
    Object.keys(form).forEach((key) => {
      if (key !== "id_document_type" && key !== "position") {
        const error = validateField(key, form[key as keyof FormData] as string)
        if (error) {
          errors[key as keyof FieldErrors] = error
          isValid = false
        }
      }
    })

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validar formulario completo
    if (!validateForm()) {
      setError("Por favor, corrige los errores en el formulario")
      return
    }

    setLoading(true)

    try {
      await registerUser({
        first_name: form.first_name,
        last_name: form.last_name,
        id_document_type: form.id_document_type,
        id_document_number: form.id_document_number,
        login: form.login,
        password: form.pass,
        telephone: form.telephone,
        username: form.username,
        position: form.position,
        displayName: `${form.first_name} ${form.last_name}`.trim(),
      })

      // Éxito - redirigir al login
      router.push("/login?message=Registro exitoso. Puedes iniciar sesión ahora.")
    } catch (err: any) {
      // Manejar errores específicos del servidor
      let errorMessage = "Error inesperado al registrar usuario"

      if (err.message) {
        if (err.message.includes("email") || err.message.includes("correo")) {
          setFieldErrors((prev) => ({ ...prev, login: "Este correo ya está registrado" }))
          errorMessage = "El correo electrónico ya está en uso"
        } else if (err.message.includes("username") || err.message.includes("usuario")) {
          setFieldErrors((prev) => ({ ...prev, username: "Este nombre de usuario ya está en uso" }))
          errorMessage = "El nombre de usuario ya está en uso"
        } else if (err.message.includes("documento")) {
          setFieldErrors((prev) => ({ ...prev, id_document_number: "Este documento ya está registrado" }))
          errorMessage = "El número de documento ya está registrado"
        } else {
          errorMessage = err.message.replace("Error al registrar usuario: ", "")
        }
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const getFieldClassName = (fieldName: keyof FieldErrors) => {
    const baseClass = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
    const hasError = fieldErrors[fieldName]

    if (hasError) {
      return `${baseClass} border-red-300 focus:border-red-500 focus:ring-red-200`
    }

    return `${baseClass} border-gray-300 focus:border-[#9F836A] focus:ring-[#9F836A]/20`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-serif text-[#9F836A] mb-2">Crear cuenta</h2>
          <p className="text-gray-600">Completa el formulario para registrarte en Hotel Hillary</p>
        </div>

        <div className="card bg-white">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("first_name")}
                  placeholder="Ingresa tus nombres"
                />
                {fieldErrors.first_name && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.first_name}
                  </p>
                )}
              </div>

              {/* Apellidos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("last_name")}
                  placeholder="Ingresa tus apellidos"
                />
                {fieldErrors.last_name && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.last_name}
                  </p>
                )}
              </div>

              {/* Tipo de documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de documento <span className="text-red-500">*</span>
                </label>
                <select
                  name="id_document_type"
                  value={form.id_document_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-[#9F836A] focus:ring-[#9F836A]/20 transition-all"
                >
                  <option value="DNI">DNI</option>
                  <option value="CE">CE</option>
                </select>
              </div>

              {/* Número de documento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de documento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="id_document_number"
                  value={form.id_document_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("id_document_number")}
                  placeholder={form.id_document_type === "DNI" ? "12345678" : "123456789"}
                />
                {fieldErrors.id_document_number && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.id_document_number}
                  </p>
                )}
              </div>

              {/* Nombre de usuario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de usuario <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("username")}
                  placeholder="usuario123"
                />
                {fieldErrors.username && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.username}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1.5">Solo letras, números y guiones bajos</p>
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="telephone"
                  value={form.telephone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName("telephone")}
                  placeholder="987654321"
                />
                {fieldErrors.telephone && (
                  <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {fieldErrors.telephone}
                  </p>
                )}
              </div>
            </div>

            <div className="border-t pt-6 space-y-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Credenciales de acceso</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="login"
                    value={form.login}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("login")}
                    placeholder="ejemplo@correo.com"
                  />
                  {fieldErrors.login && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {fieldErrors.login}
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contraseña <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="pass"
                    value={form.pass}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getFieldClassName("pass")}
                    placeholder="Mínimo 6 caracteres"
                  />
                  {fieldErrors.pass && (
                    <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                      <span>⚠</span> {fieldErrors.pass}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1.5">Debe contener al menos una mayúscula y una minúscula</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#9F836A] hover:bg-[#8A7158] text-white py-3 font-serif text-lg rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Registrando...
                  </span>
                ) : (
                  "Crear cuenta"
                )}
              </Button>
              <Button
                type="button"
                onClick={() => router.push("/login")}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 font-medium text-lg rounded-lg transition-colors"
              >
                Ya tengo cuenta
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}