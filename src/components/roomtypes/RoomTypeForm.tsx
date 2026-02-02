"use client"

import type React from "react"
import { useState } from "react"
// Asegúrate de tener estos tipos definidos en tu archivo de tipos
import type { RoomType, RoomTypePayload } from "@/lib/types/room_type"

interface RoomTypeFormProps {
  initialData: RoomType
  onSubmit: (data: RoomTypePayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

// Estado local del formulario (todo como string para facilitar la edición)
type FormState = {
  name: string
  description: string
  basePrice: string
  capacity: string
  amenities: string
  status: string
}

export function RoomTypeForm({ initialData, onSubmit, onCancel, isSaving }: RoomTypeFormProps) {
  
  const [form, setForm] = useState<FormState>({
    name: initialData.name ?? "",
    description: initialData.description ?? "",
    basePrice: initialData.basePrice?.toString() ?? "0",
    capacity: initialData.capacity?.toString() ?? "1",
    // Convertimos el array de amenidades a un string separado por comas para el input
    amenities: Array.isArray(initialData.amenities) ? initialData.amenities.join(", ") : "",
    status: initialData.status ?? "A"
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Procesamos el string de amenidades de vuelta a un array limpio
    const amenitiesArray = form.amenities
      .split(",")
      .map((a) => a.trim())     // Quitar espacios alrededor
      .filter((a) => a !== "")  // Quitar elementos vacíos (ej: "Wifi,,TV")

    const payload: RoomTypePayload = {
      name: form.name,
      description: form.description,
      basePrice: Number.parseFloat(form.basePrice) || 0,
      capacity: Number.parseInt(form.capacity) || 1,
      amenities: amenitiesArray,
      status: form.status,
      // NOTA: 'createdBy'/'updatedBy' se manejan en el backend con el token del usuario.
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      
      {/* SECCIÓN: INFORMACIÓN PRINCIPAL */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Información Básica</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <FormField 
            label="Nombre del Tipo (Ej. Suite Presidencial)" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            required 
            placeholder="Ej. Doble Estándar"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField 
            label="Precio Base Sugerido (S/)" 
            name="basePrice" 
            type="number" 
            step="0.01"
            value={form.basePrice} 
            onChange={handleChange} 
            required 
          />
          <FormField 
            label="Capacidad Máxima (Pers.)" 
            name="capacity" 
            type="number" 
            value={form.capacity} 
            onChange={handleChange} 
            required 
          />
        </div>
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN: DETALLES Y AMENIDADES */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Detalles</h3>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-600)]">Descripción</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-600)]">Amenidades (separadas por coma)</label>
          <input
            type="text"
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            placeholder="Ej: Jacuzzi, Vista al Mar, King Size Bed"
            className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
          />
          <p className="text-[10px] text-gray-400 text-right">Escribe las características separadas por comas.</p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-600)]">Estado</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
          >
            <option value="A">Activo (Disponible para reservas)</option>
            <option value="I">Inactivo (Oculto)</option>
          </select>
        </div>
      </div>

      <FormActions onCancel={onCancel} isSaving={isSaving} />
    </form>
  )
}

// --- Componentes auxiliares ---

interface FormFieldProps {
  label: string
  name: string
  value?: string
  type?: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  step?: string
}

function FormField({
  label,
  name,
  value,
  type = "text",
  onChange,
  required,
  placeholder,
  step,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-[var(--color-600)]">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        step={step}
        className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm 
                   text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
      />
    </div>
  )
}

interface FormActionsProps {
  onCancel: () => void
  isSaving: boolean
}

function FormActions({ onCancel, isSaving }: FormActionsProps) {
  return (
    <div className="pt-4 flex justify-end gap-2 sticky bottom-0 bg-[var(--card-color)] pb-2 border-t border-[var(--border-color)] mt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-xl border border-[var(--border-color)] 
                   px-4 py-2 text-xs font-medium text-[var(--dark-color)] hover:bg-[var(--body-color)]/60 disabled:opacity-60"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-xl bg-[var(--primary-color)] 
                   px-4 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-70"
      >
        {isSaving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  )
}