"use client"

import type React from "react"
import { useState } from "react"
import { CrudForm, FormField, FormSection, SelectField, TextAreaField } from "@/components/forms/fields"
import { ACTIVE_STATUS_OPTIONS, PERMISSION_TYPE_OPTIONS } from "@/lib/constants/permissions"
import type { Permission, PermissionPayload, PermissionType } from "@/lib/types/permission"

interface PermissionFormProps {
  // null = crear nuevo
  initialData: Permission | null
  onSubmit: (data: PermissionPayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

const orNull = (value: string) => value.trim() || null

export function PermissionForm({ initialData, onSubmit, onCancel, isSaving }: PermissionFormProps) {
  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    moduleId: initialData?.moduleId?.toString() ?? "",
    moduleOrigin: initialData?.moduleOrigin ?? "",
    modulePosition: initialData?.modulePosition?.toString() ?? "0",
    familyPosition: initialData?.familyPosition?.toString() ?? "",
    description: initialData?.description ?? "",
    perms: initialData?.perms ?? "",
    subperms: initialData?.subperms ?? "",
    type: initialData?.type ?? "r",
    bydefault: initialData?.bydefault ?? "",
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
      moduleId: Number.parseInt(form.moduleId),
      moduleOrigin: orNull(form.moduleOrigin),
      modulePosition: Number.parseInt(form.modulePosition) || 0,
      familyPosition: form.familyPosition.trim() === "" ? null : Number.parseInt(form.familyPosition),
      description: orNull(form.description),
      perms: form.perms.trim(),
      subperms: orNull(form.subperms),
      type: form.type as PermissionType,
      bydefault: orNull(form.bydefault),
      status: form.status,
    })
  }

  return (
    <CrudForm onSubmit={handleSubmit} onCancel={onCancel} isSaving={isSaving}>
      <FormSection title="Permiso" variant="boxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Nombre"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            maxLength={100}
            placeholder="Ej. Ver reservas"
          />
          <SelectField label="Tipo" name="type" value={form.type} onChange={handleChange} options={PERMISSION_TYPE_OPTIONS} />
          <FormField
            label="Permisos principales"
            name="perms"
            value={form.perms}
            onChange={handleChange}
            required
            maxLength={255}
            placeholder="Ej. reservations"
          />
          <FormField
            label="Subpermisos"
            name="subperms"
            value={form.subperms}
            onChange={handleChange}
            maxLength={255}
            placeholder="Ej. read"
          />
        </div>
        <TextAreaField
          label="Descripción"
          name="description"
          value={form.description}
          onChange={handleChange}
          maxLength={255}
        />
      </FormSection>

      <FormSection title="Módulo">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="ID del módulo"
            name="moduleId"
            type="number"
            value={form.moduleId}
            onChange={handleChange}
            required
          />
          <FormField
            label="Origen del módulo"
            name="moduleOrigin"
            value={form.moduleOrigin}
            onChange={handleChange}
            maxLength={255}
          />
          <FormField
            label="Posición en el módulo"
            name="modulePosition"
            type="number"
            value={form.modulePosition}
            onChange={handleChange}
            required
          />
          <FormField
            label="Posición en la familia"
            name="familyPosition"
            type="number"
            value={form.familyPosition}
            onChange={handleChange}
          />
          <FormField
            label="Valor por defecto"
            name="bydefault"
            value={form.bydefault}
            onChange={handleChange}
            maxLength={255}
          />
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
