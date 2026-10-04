"use client"

import type React from "react"
import { useState } from "react"
import { CrudForm, FormField, FormSection, SelectField, TextAreaField } from "@/components/forms/fields"
import { ACTIVE_STATUS_OPTIONS } from "@/lib/constants/permissions"
import type { Role, RolePayload } from "@/lib/types/role"

interface RoleFormProps {
  // null = crear nuevo
  initialData: Role | null
  onSubmit: (data: RolePayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

const toIntOrNull = (value: string) => (value.trim() === "" ? null : Number.parseInt(value))

export function RoleForm({ initialData, onSubmit, onCancel, isSaving }: RoleFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    prefix: initialData?.prefix ?? "",
    description: initialData?.description ?? "",
    level: initialData?.level?.toString() ?? "",
    officeId: initialData?.officeId?.toString() ?? "",
    status: initialData?.status ?? "A",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name: form.name.trim(),
      prefix: form.prefix.trim() || null,
      description: form.description.trim() || null,
      level: toIntOrNull(form.level),
      officeId: toIntOrNull(form.officeId),
      status: form.status,
    })
  }

  return (
    <CrudForm onSubmit={handleSubmit} onCancel={onCancel} isSaving={isSaving}>
      <FormSection title="Información del rol" variant="boxed">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <FormField
              label="Nombre"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              maxLength={255}
              placeholder="Ej. Recepcionistas"
            />
          </div>
          <FormField
            label="Prefijo"
            name="prefix"
            value={form.prefix}
            onChange={handleChange}
            maxLength={10}
            placeholder="Ej. REC"
          />
        </div>
        <TextAreaField label="Descripción" name="description" value={form.description} onChange={handleChange} />
      </FormSection>

      <FormSection title="Configuración">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField label="Nivel" name="level" type="number" value={form.level} onChange={handleChange} />
          <FormField label="ID de oficina" name="officeId" type="number" value={form.officeId} onChange={handleChange} />
          <SelectField
            label="Estado"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={ACTIVE_STATUS_OPTIONS}
          />
        </div>
      </FormSection>
    </CrudForm>
  )
}
