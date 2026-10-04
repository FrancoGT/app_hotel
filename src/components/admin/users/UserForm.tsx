"use client"

import type React from "react"
import { useState } from "react"
import { CheckboxField, CrudForm, FormField, FormSection, SelectField } from "@/components/forms/fields"
import { ACTIVE_STATUS_OPTIONS } from "@/lib/constants/permissions"
import type { DocumentType, User, UserAdminPayload, UserAdminUpdatePayload } from "@/lib/types/user"

interface UserFormProps {
  // null = crear nuevo
  initialData: User | null
  onSubmit: (data: UserAdminPayload | UserAdminUpdatePayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

const DOCUMENT_OPTIONS = [
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "Carné de extranjería" },
]

// "" → null: el backend valida longitudes mínimas (p. ej. teléfono) aunque el campo sea opcional
const orNull = (value: string) => value.trim() || null

export function UserForm({ initialData, onSubmit, onCancel, isSaving }: UserFormProps) {
  const isEditing = !!initialData
  const [form, setForm] = useState({
    first_name: initialData?.first_name ?? "",
    last_name: initialData?.last_name ?? "",
    id_document_type: initialData?.id_document_type ?? "DNI",
    id_document_number: initialData?.id_document_number ?? "",
    telephone: initialData?.telephone ?? "",
    position: initialData?.position ?? "",
    username: initialData?.username ?? "",
    login: initialData?.login ?? "",
    displayName: initialData?.displayName ?? "",
    pass: "",
    admin: initialData?.admin ?? false,
    employee: initialData?.employee ?? false,
    status: "A",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const next = type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    setForm((prev) => ({ ...prev, [name]: next }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const common = {
      first_name: orNull(form.first_name),
      last_name: orNull(form.last_name),
      id_document_type: form.id_document_type as DocumentType,
      id_document_number: orNull(form.id_document_number),
      telephone: orNull(form.telephone),
      position: orNull(form.position),
      username: orNull(form.username),
      login: form.login.trim(),
      displayName: form.displayName.trim(),
      admin: form.admin,
      employee: form.employee,
    }

    if (isEditing) {
      // La contraseña solo se envía si se escribió una nueva; el estado se cambia desde la tabla
      await onSubmit(form.pass ? { ...common, pass: form.pass } : common)
    } else {
      await onSubmit({ ...common, pass: form.pass, status: form.status as "A" | "I" })
    }
  }

  return (
    <CrudForm onSubmit={handleSubmit} onCancel={onCancel} isSaving={isSaving}>
      <FormSection title="Acceso" variant="boxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Login (correo)"
            name="login"
            type="email"
            value={form.login}
            onChange={handleChange}
            required
            maxLength={50}
            placeholder="usuario@correo.com"
          />
          <FormField
            label="Nombre para mostrar"
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            required
            maxLength={255}
          />
        </div>
        <FormField
          label={isEditing ? "Nueva contraseña (dejar vacío para no cambiarla)" : "Contraseña"}
          name="pass"
          type="password"
          value={form.pass}
          onChange={handleChange}
          required={!isEditing}
          minLength={8}
          maxLength={100}
          autoComplete="new-password"
        />
        <div className="flex flex-wrap gap-6">
          <CheckboxField label="Administrador" name="admin" checked={form.admin} onChange={handleChange} />
          <CheckboxField label="Empleado" name="employee" checked={form.employee} onChange={handleChange} />
        </div>
        {!isEditing && (
          <SelectField
            label="Estado"
            name="status"
            value={form.status}
            onChange={handleChange}
            options={ACTIVE_STATUS_OPTIONS}
          />
        )}
      </FormSection>

      <FormSection title="Datos personales">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Nombres" name="first_name" value={form.first_name} onChange={handleChange} maxLength={100} />
          <FormField label="Apellidos" name="last_name" value={form.last_name} onChange={handleChange} maxLength={100} />
          <SelectField
            label="Tipo de documento"
            name="id_document_type"
            value={form.id_document_type}
            onChange={handleChange}
            options={DOCUMENT_OPTIONS}
          />
          <FormField
            label="Número de documento"
            name="id_document_number"
            value={form.id_document_number}
            onChange={handleChange}
            maxLength={20}
          />
          <FormField
            label="Teléfono"
            name="telephone"
            type="tel"
            value={form.telephone}
            onChange={handleChange}
            minLength={8}
            maxLength={20}
          />
          <FormField
            label="Cargo"
            name="position"
            value={form.position}
            onChange={handleChange}
            maxLength={50}
            placeholder="Ej. Recepcionista"
          />
          <FormField label="Usuario interno" name="username" value={form.username} onChange={handleChange} maxLength={500} />
        </div>
      </FormSection>
    </CrudForm>
  )
}
