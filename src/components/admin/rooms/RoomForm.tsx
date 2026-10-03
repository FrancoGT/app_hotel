"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { CrudForm, FormField, FormSection, SelectField, TextAreaField } from "@/components/forms/fields"
import { RoomImageEditor } from "./RoomImageEditor"
import { establishmentService } from "@/lib/services/establishmentService"
import { roomTypeService } from "@/lib/services/roomTypeService"
import { ROOM_STATUS } from "@/lib/constants/status"
import { parseCommaList } from "@/lib/utils/format"
import type { Room, RoomPayload } from "@/lib/types/room"

interface RoomFormProps {
  // null = crear nueva
  initialData: Room | null
  onSubmit: (data: RoomPayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

type Option = { value: number; label: string }

const STATUS_OPTIONS = Object.entries(ROOM_STATUS).map(([value, { label }]) => ({ value, label }))

export function RoomForm({ initialData, onSubmit, onCancel, isSaving }: RoomFormProps) {
  const [establishments, setEstablishments] = useState<Option[]>([])
  const [roomTypes, setRoomTypes] = useState<Option[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const [form, setForm] = useState({
    roomNumber: initialData?.roomNumber ?? "",
    floor: initialData?.floor?.toString() ?? "1",
    status: initialData?.status ?? "available",
    maxOccupancy: initialData?.maxOccupancy?.toString() ?? "2",
    pricePerNight: initialData?.pricePerNight?.toString() ?? "0",
    description: initialData?.description ?? "",
    features: initialData?.features?.join(", ") ?? "",
    establishmentId: initialData?.establishmentId?.toString() ?? "",
    roomTypeId: initialData?.roomTypeId?.toString() ?? "",
  })

  useEffect(() => {
    Promise.all([establishmentService.list(), roomTypeService.list()])
      .then(([ests, types]) => {
        setEstablishments(ests.map((e) => ({ value: e.id, label: e.name })))
        setRoomTypes(types.map((t) => ({ value: t.id, label: t.name })))
        // Al crear, preselecciona la primera opción de cada lista
        setForm((prev) => ({
          ...prev,
          establishmentId: prev.establishmentId || (ests[0]?.id.toString() ?? ""),
          roomTypeId: prev.roomTypeId || (types[0]?.id.toString() ?? ""),
        }))
      })
      .catch((error) => console.error("Error cargando listas:", error))
      .finally(() => setLoadingOptions(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit({
      roomNumber: form.roomNumber,
      floor: Number.parseInt(form.floor) || 1,
      status: form.status,
      maxOccupancy: Number.parseInt(form.maxOccupancy) || 1,
      pricePerNight: Number.parseFloat(form.pricePerNight) || 0,
      description: form.description,
      features: parseCommaList(form.features),
      establishmentId: Number.parseInt(form.establishmentId),
      roomTypeId: Number.parseInt(form.roomTypeId),
      createdBy: 0,
    })
  }

  return (
    <CrudForm onSubmit={handleSubmit} onCancel={onCancel} isSaving={isSaving}>
      <FormSection title="Ubicación y Tipo" variant="boxed">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Establecimiento (Hotel)"
            name="establishmentId"
            value={form.establishmentId}
            onChange={handleChange}
            options={establishments}
            loading={loadingOptions}
            required
          />
          <SelectField
            label="Tipo de Habitación"
            name="roomTypeId"
            value={form.roomTypeId}
            onChange={handleChange}
            options={roomTypes}
            loading={loadingOptions}
            required
          />
        </div>
      </FormSection>

      <hr className="border-[var(--border-color)]" />

      <FormSection title="Detalles">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Número de Habitación"
            name="roomNumber"
            value={form.roomNumber}
            onChange={handleChange}
            required
            placeholder="Ej. 101"
          />
          <FormField label="Piso" name="floor" type="number" value={form.floor} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Precio por Noche (S/)"
            name="pricePerNight"
            type="number"
            step="0.01"
            value={form.pricePerNight}
            onChange={handleChange}
            required
          />
          <FormField
            label="Capacidad Máxima"
            name="maxOccupancy"
            type="number"
            value={form.maxOccupancy}
            onChange={handleChange}
            required
          />
        </div>
        <SelectField
          label="Estado Actual"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={STATUS_OPTIONS}
        />
      </FormSection>

      <hr className="border-[var(--border-color)]" />

      <FormSection title="Descripción">
        <TextAreaField label="Descripción General" name="description" value={form.description} onChange={handleChange} />
        <FormField
          label="Características"
          name="features"
          value={form.features}
          onChange={handleChange}
          placeholder="Ej: Wifi, TV Cable"
        />
      </FormSection>

      {initialData ? (
        <>
          <hr className="border-[var(--border-color)]" />
          <RoomImageEditor roomId={initialData.id} roomNumber={initialData.roomNumber} />
        </>
      ) : (
        <p className="text-xs text-[var(--color-400)] bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
          💡 Podrás agregar una imagen después de crear la habitación, al editarla.
        </p>
      )}
    </CrudForm>
  )
}
