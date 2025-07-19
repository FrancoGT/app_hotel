"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerUser } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    displayName: "",
    login: "",
    pass: "",
    telephone: "",
    username: "",
  })

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
      await registerUser({
        ...form,
        password: form.pass, // ✅ mapeo correcto
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
      <h2 className="text-2xl font-serif text-center text-[#9F836A] mb-4">Crear cuenta</h2>
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        {[
          { label: "Nombre completo", name: "displayName" },
          { label: "Correo Electrónico", name: "login" },
          { label: "Contraseña", name: "pass", type: "password" },
          { label: "Teléfono", name: "telephone" },
          { label: "Nombre de usuario", name: "username" },
        ].map(({ label, name, type = "text" }) => (
          <div key={name}>
            <label className="block text-sm text-gray-700">{label}</label>
            <input
              type={type}
              name={name}
              value={form[name as keyof typeof form]}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-[#9F836A]"
            />
          </div>
        ))}

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
