"use client"

import type React from "react"
import { useState } from "react"
import { CheckboxField, CrudForm, FormField, FormSection, TextAreaField } from "@/components/forms/fields"
import type { Establishment, EstablishmentPayload } from "@/lib/types/establishment"

interface EstablishmentFormProps {
  // null = crear nuevo
  initialData: Establishment | null
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

function toFormState(e: Establishment | null): FormState {
  return {
    name: e?.name ?? "",
    description: e?.description ?? "",
    address: e?.address ?? "",
    city: e?.city ?? "",
    country: e ? e.country ?? "" : "Perú",
    zipCode: e?.zipCode ?? "",
    phone: e?.phone ?? "",
    email: e?.email ?? "",
    website: e?.website ?? "",
    stars: e?.stars?.toString() ?? (e ? "" : "0"),
    checkInTime: e ? e.checkInTime ?? "" : "14:00:00",
    checkOutTime: e ? e.checkOutTime ?? "" : "12:00:00",
    latitude: e?.latitude?.toString() ?? "",
    longitude: e?.longitude?.toString() ?? "",
    status: e?.status ?? "A",
    ai_auto_pricing: e?.aiSettings?.auto_pricing ?? false,
    ai_welcome_message: e?.aiSettings?.welcome_message ?? true,
  }
}

const orNull = (value: string) => value || null

export function EstablishmentForm({ initialData, onSubmit, onCancel, isSaving }: EstablishmentFormProps) {
  const [form, setForm] = useState<FormState>(() => toFormState(initialData))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement
      setForm((prev) => (name === "status" ? { ...prev, status: checked ? "A" : "I" } : { ...prev, [name]: checked }))
      return
    }
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      name: form.name,
      description: orNull(form.description),
      address: orNull(form.address),
      city: orNull(form.city),
      country: orNull(form.country),
      zipCode: orNull(form.zipCode),
      phone: orNull(form.phone),
      email: orNull(form.email),
      website: orNull(form.website),
      stars: form.stars ? Number.parseInt(form.stars) : null,
      latitude: form.latitude ? Number.parseFloat(form.latitude) : null,
      longitude: form.longitude ? Number.parseFloat(form.longitude) : null,
      checkInTime: orNull(form.checkInTime),
      checkOutTime: orNull(form.checkOutTime),
      status: form.status,
      aiSettings: {
        auto_pricing: form.ai_auto_pricing,
        welcome_message: form.ai_welcome_message,
      },
    })
  }

  return (
    <CrudForm onSubmit={handleSubmit} onCancel={onCancel} isSaving={isSaving}>
      <FormSection title="General">
        <FormField label="Nombre del Hotel" name="name" value={form.name} onChange={handleChange} required />
        <TextAreaField label="Descripción" name="description" value={form.description} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Estrellas (1-5)" name="stars" type="number" value={form.stars} onChange={handleChange} />
          <CheckboxField label="Estado Activo" name="status" checked={form.status === "A"} onChange={handleChange} />
        </div>
      </FormSection>

      <hr className="border-[var(--border-color)]" />

      <FormSection title="Contacto">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <FormField label="Teléfono" name="phone" value={form.phone} onChange={handleChange} />
        </div>
        <FormField label="Sitio Web" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
      </FormSection>

      <hr className="border-[var(--border-color)]" />

      <FormSection title="Ubicación">
        <FormField label="Dirección" name="address" value={form.address} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Ciudad" name="city" value={form.city} onChange={handleChange} />
          <FormField label="País" name="country" value={form.country} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Código Postal" name="zipCode" value={form.zipCode} onChange={handleChange} />
          <FormField label="Latitud" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} />
          <FormField label="Longitud" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} />
        </div>
      </FormSection>

      <hr className="border-[var(--border-color)]" />

      <FormSection title="Horarios">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Check-in" name="checkInTime" type="time" step="1" value={form.checkInTime} onChange={handleChange} />
          <FormField label="Check-out" name="checkOutTime" type="time" step="1" value={form.checkOutTime} onChange={handleChange} />
        </div>
      </FormSection>

      <hr className="border-[var(--border-color)]" />

      <FormSection title="Configuración IA">
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
      </FormSection>
    </CrudForm>
  )
}
