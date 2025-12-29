"use client"

import type React from "react"
import type { Establishment, EstablishmentPayload } from "@/lib/types/establishment"
import { useState } from "react"

interface EstablishmentFormProps {
  initialData: Establishment
  onSubmit: (data: EstablishmentPayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

type FormState = {
  name: string
  description: string
  address: string
  city: string
  country: string
  zipCode: string
  phone: string
  email: string
  website: string
  stars: string
  checkInTime: string
  checkOutTime: string
  latitude: string
  longitude: string
  status: string
  ai_auto_pricing: boolean
  ai_welcome_message: boolean
}

export function EstablishmentForm({ initialData, onSubmit, onCancel, isSaving }: EstablishmentFormProps) {
  const [form, setForm] = useState<FormState>({
    name: initialData.name ?? "",
    description: initialData.description ?? "",
    address: initialData.address ?? "",
    city: initialData.city ?? "",
    country: initialData.country ?? "",
    zipCode: initialData.zipCode ?? "",
    phone: initialData.phone ?? "",
    email: initialData.email ?? "",
    website: initialData.website ?? "",
    stars: initialData.stars?.toString() ?? "",
    checkInTime: initialData.checkInTime ?? "",
    checkOutTime: initialData.checkOutTime ?? "",
    latitude: initialData.latitude?.toString() ?? "",
    longitude: initialData.longitude?.toString() ?? "",
    status: initialData.status ?? "A",

    ai_auto_pricing: initialData.aiSettings?.auto_pricing ?? false,
    ai_welcome_message: initialData.aiSettings?.welcome_message ?? true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === "checkbox") {
      if (name === "status") {
        setForm((prev) => ({ ...prev, status: checked ? "A" : "I" }))
      } else {
        setForm((prev) => ({ ...prev, [name]: checked }))
      }
      return
    }

    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const payload: EstablishmentPayload = {
      name: form.name,
      description: form.description || null,
      address: form.address || null,
      city: form.city || null,
      country: form.country || null,
      zipCode: form.zipCode || null,
      phone: form.phone || null,
      email: form.email || null,
      website: form.website || null,

      stars: form.stars ? Number.parseInt(form.stars) : null,
      latitude: form.latitude ? Number.parseFloat(form.latitude) : null,
      longitude: form.longitude ? Number.parseFloat(form.longitude) : null,

      checkInTime: form.checkInTime || null,
      checkOutTime: form.checkOutTime || null,
      status: form.status,

      aiSettings: {
        auto_pricing: form.ai_auto_pricing,
        welcome_message: form.ai_welcome_message,
      },
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {/* SECCIÓN: INFORMACIÓN GENERAL */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">General</h3>
        <FormField label="Nombre del Hotel" name="name" value={form.name} onChange={handleChange} required />

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

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Estrellas (1-5)" name="stars" type="number" value={form.stars} onChange={handleChange} />
          <FormField
            label="Estado Activo"
            name="status"
            type="checkbox"
            checked={form.status === "A"}
            onChange={handleChange}
            isSwitch
          />
        </div>
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN: CONTACTO */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Contacto</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <FormField label="Teléfono" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <FormField
          label="Sitio Web"
          name="website"
          value={form.website}
          onChange={handleChange}
          placeholder="https://..."
        />
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN: UBICACIÓN */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Ubicación</h3>
        <FormField label="Dirección" name="address" value={form.address} onChange={handleChange} />

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ciudad" name="city" value={form.city} onChange={handleChange} />
          <FormField label="País" name="country" value={form.country} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField label="Código Postal" name="zipCode" value={form.zipCode} onChange={handleChange} />
          <FormField
            label="Latitud"
            name="latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={handleChange}
          />
          <FormField
            label="Longitud"
            name="longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={handleChange}
          />
        </div>
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN: HORARIOS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Horarios</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Check-in"
            name="checkInTime"
            type="time"
            value={form.checkInTime}
            onChange={handleChange}
            step="1"
          />
          <FormField
            label="Check-out"
            name="checkOutTime"
            type="time"
            value={form.checkOutTime}
            onChange={handleChange}
            step="1"
          />
        </div>
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN: CONFIGURACIÓN IA */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Configuración IA</h3>
        <div className="space-y-2">
          <CheckboxField
            label="Activar Precios Automáticos (Auto Pricing)"
            name="ai_auto_pricing"
            checked={form.ai_auto_pricing}
            onChange={handleChange}
          />
          <CheckboxField
            label="Enviar Mensaje de Bienvenida"
            name="ai_welcome_message"
            checked={form.ai_welcome_message}
            onChange={handleChange}
          />
        </div>
      </div>

      <FormActions onCancel={onCancel} isSaving={isSaving} />
    </form>
  )
}

// --- COMPONENTES AUXILIARES ---

interface FormFieldProps {
  label: string
  name: string
  value?: string
  type?: string
  checked?: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  step?: string
  isSwitch?: boolean
}

function FormField({
  label,
  name,
  value,
  type = "text",
  checked,
  onChange,
  required,
  placeholder,
  step,
  isSwitch,
}: FormFieldProps) {
  if (isSwitch || type === "checkbox") {
    return <CheckboxField label={label} name={name} checked={!!checked} onChange={onChange} />
  }

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

interface CheckboxFieldProps {
  label: string
  name: string
  checked: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

function CheckboxField({ label, name, checked, onChange }: CheckboxFieldProps) {
  return (
    <div className="flex items-center gap-2">
      <input
        id={name}
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[var(--border-color)] text-[var(--primary-color)] cursor-pointer"
      />
      <label htmlFor={name} className="text-xs text-[var(--color-700)] cursor-pointer select-none">
        {label}
      </label>
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
        {isSaving ? "Guardando…" : "Guardar"}
      </button>
    </div>
  )
}
