"use client"

import type React from "react"
import { useState } from "react"
import { CrudForm, FormField, FormSection, SelectField, TextAreaField } from "@/components/forms/fields"
import { parseCommaList } from "@/lib/utils/format"
import type { RoomType, RoomTypePayload } from "@/lib/types/room_type"

interface RoomTypeFormProps {
  // null = crear nuevo
  initialData: RoomType | null
  onSubmit: (data: RoomTypePayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

const STATUS_OPTIONS = [
  { value: "A", label: "Activo (Disponible para reservas)" },
  { value: "I", label: "Inactivo (Oculto)" },
]

export function RoomTypeForm({ initialData, onSubmit, onCancel, isSaving }: RoomTypeFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    basePrice: initialData?.basePrice?.toString() ?? "0",
    capacity: initialData?.capacity?.toString() ?? "1",
    amenities: initialData?.amenities?.join(", ") ?? "",
    status: initialData?.status ?? "A",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // createdBy/updatedBy los asigna el backend a partir del token
    await onSubmit({
      name: form.name,
      description: form.description,
      basePrice: Number.parseFloat(form.basePrice) || 0,
      capacity: Number.parseInt(form.capacity) || 1,
      amenities: parseCommaList(form.amenities),
      status: form.status,
    })
  }

  return (
    <CrudForm onSubmit={handleSubmit} onCancel={onCancel} isSaving={isSaving}>
      <FormSection title="Información Básica" variant="boxed">
        <FormField
          label="Nombre del Tipo (Ej. Suite Presidencial)"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Ej. Doble Estándar"
        />
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
      </FormSection>

      <hr className="border-[var(--border-color)]" />

      <FormSection title="Detalles">
        <TextAreaField label="Descripción" name="description" value={form.description} onChange={handleChange} />
        <FormField
          label="Amenidades (separadas por coma)"
          name="amenities"
          value={form.amenities}
          onChange={handleChange}
          placeholder="Ej: Jacuzzi, Vista al Mar, King Size Bed"
          hint={<p className="text-[10px] text-gray-400 text-right">Escribe las características separadas por comas.</p>}
        />
        <SelectField label="Estado" name="status" value={form.status} onChange={handleChange} options={STATUS_OPTIONS} />
      </FormSection>
    </CrudForm>
  )
}
