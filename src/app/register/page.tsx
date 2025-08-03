"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState<{
    first_name: string
    last_name: string
    id_document_type: "DNI" | "CE" // ← 🔧 el fix que elimina el error
    id_document_number: string
    login: string
    pass: string
    telephone: string
    username: string
    position: string
  }>({
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await registerUser({
        ...form,
        password: form.pass,
        displayName: `${form.first_name} ${form.last_name}`.trim()
      })
      router.push("/login")
    } catch (err: any) {
      setError(err.message || "Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 border border-gray-300 rounded-lg shadow-md">
      <h2 className="text-2xl font-serif text-center text-[#9F836A] mb-4">
        Crear cuenta
      </h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nombre */}
        <div>
          <label className="block text-sm text-gray-700">Nombres</label>
          <input
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          />
        </div>

        {/* Apellidos */}
        <div>
          <label className="block text-sm text-gray-700">Apellidos</label>
          <input
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          />
        </div>

        {/* Tipo de documento */}
        <div>
          <label className="block text-sm text-gray-700">Tipo de documento</label>
          <select
            name="id_document_type"
            value={form.id_document_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          >
            <option value="DNI">DNI</option>
            <option value="CE">CE</option>
          </select>
        </div>

        {/* Número de documento */}
        <div>
          <label className="block text-sm text-gray-700">Número de documento</label>
          <input
            type="text"
            name="id_document_number"
            value={form.id_document_number}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm text-gray-700">Correo Electrónico</label>
          <input
            type="email"
            name="login"
            value={form.login}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          />
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm text-gray-700">Contraseña</label>
          <input
            type="password"
            name="pass"
            value={form.pass}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm text-gray-700">Teléfono</label>
          <input
            type="text"
            name="telephone"
            value={form.telephone}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          />
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm text-gray-700">Nombre de usuario</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
          />
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
