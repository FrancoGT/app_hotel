"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
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
        password: form.pass, // Enviamos como 'password', la función lo convierte a 'pass'
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
    const baseClass = "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring transition-colors"
    const hasError = fieldErrors[fieldName]

    if (hasError) {
      return `${baseClass} border-red-300 focus:border-red-500 focus:ring-red-200`
    }

    return `${baseClass} border-gray-300 focus:border-[#9F836A] focus:ring-[#9F836A]/20`
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-2xl font-serif text-center text-[#9F836A] mb-4">Crear cuenta</h2>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
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
          {fieldErrors.first_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.first_name}</p>}
        </div>

        {/* Apellidos */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
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
          {fieldErrors.last_name && <p className="text-red-500 text-xs mt-1">{fieldErrors.last_name}</p>}
        </div>

        {/* Tipo de documento */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
            Tipo de documento <span className="text-red-500">*</span>
          </label>
          <select
            name="id_document_type"
            value={form.id_document_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          >
            <option value="DNI">DNI</option>
            <option value="CE">CE</option>
          </select>
        </div>

        {/* Número de documento */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
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
            <p className="text-red-500 text-xs mt-1">{fieldErrors.id_document_number}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
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
          {fieldErrors.login && <p className="text-red-500 text-xs mt-1">{fieldErrors.login}</p>}
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
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
          {fieldErrors.pass && <p className="text-red-500 text-xs mt-1">{fieldErrors.pass}</p>}
          <p className="text-xs text-gray-500 mt-1">Debe contener al menos una mayúscula y una minúscula</p>
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
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
          {fieldErrors.telephone && <p className="text-red-500 text-xs mt-1">{fieldErrors.telephone}</p>}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">
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
          {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
          <p className="text-xs text-gray-500 mt-1">Solo letras, números y guiones bajos</p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-[#9F836A] hover:bg-[#8A7158] text-white py-2 font-serif"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </Button>
      </form>
    </div>
  )
}