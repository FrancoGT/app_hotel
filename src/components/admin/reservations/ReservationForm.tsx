"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { CrudForm, FormField, FormSection, SelectField, TextAreaField } from "@/components/forms/fields"
import { roomService } from "@/lib/services/roomService"
import { userService } from "@/lib/services/userService"
import { PAYMENT_STATUS, RESERVATION_STATUS } from "@/lib/constants/status"
import { calculateTotalAmount, getNights } from "@/lib/utils/roomUtils"
import { isoDate } from "@/lib/utils/format"
import type { ReservationAdmin, ReservationPayload, ReservationUpdatePayload } from "@/lib/types/reservation"
import type { Room } from "@/lib/types/room"
import type { UserOption } from "@/lib/types/user"

interface ReservationFormProps {
  // null = reserva manual nueva (el admin elige el cliente)
  initialData: ReservationAdmin | null
  onSubmit: (data: ReservationPayload | ReservationUpdatePayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

const toOptions = (map: typeof RESERVATION_STATUS) =>
  Object.entries(map).map(([value, { label }]) => ({ value, label }))

const RESERVATION_STATUS_OPTIONS = toOptions(RESERVATION_STATUS)
const PAYMENT_STATUS_OPTIONS = toOptions(PAYMENT_STATUS)

export function ReservationForm({ initialData, onSubmit, onCancel, isSaving }: ReservationFormProps) {
  const isEditing = initialData !== null

  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<UserOption[]>([])
  const [loadingResources, setLoadingResources] = useState(true)

  const [form, setForm] = useState({
    userId: "",
    roomId: initialData?.roomId?.toString() ?? "",
    checkInDate: initialData?.checkInDate?.split("T")[0] ?? isoDate(0),
    checkOutDate: initialData?.checkOutDate?.split("T")[0] ?? isoDate(1),
    adults: initialData?.adults?.toString() ?? "2",
    children: initialData?.children?.toString() ?? "0",
    specialRequests: initialData?.specialRequests ?? "",
    aiNotes: initialData?.aiNotes ?? "",
    status: initialData?.status ?? "confirmed",
    paymentStatus: initialData?.paymentStatus ?? "pending",
    cancellationReason: initialData?.cancellationReason ?? "",
  })

  useEffect(() => {
    // La lista de clientes solo hace falta al crear; si falla, el formulario sigue usable
    const loadUsers = isEditing ? Promise.resolve([]) : userService.list().catch(() => [])
    Promise.all([roomService.list(), loadUsers])
      .then(([roomsData, usersData]) => {
        setRooms(roomsData)
        setUsers(usersData)
      })
      .catch((e) => console.error("Error cargando recursos", e))
      .finally(() => setLoadingResources(false))
  }, [isEditing])

  // Total calculado a partir de la habitación y las fechas; al editar se conserva el guardado hasta que cambien
  const selectedRoom = rooms.find((r) => r.id.toString() === form.roomId)
  const nights = getNights(form.checkInDate, form.checkOutDate)
  const totalAmount =
    selectedRoom && nights > 0
      ? calculateTotalAmount(selectedRoom.pricePerNight, nights)
      : initialData?.totalAmount ?? 0

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const basePayload = {
      roomId: Number.parseInt(form.roomId),
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      adults: Number.parseInt(form.adults),
      children: Number.parseInt(form.children),
      totalAmount,
      specialRequests: form.specialRequests,
      aiNotes: form.aiNotes,
    }

    if (isEditing) {
      await onSubmit({
        ...basePayload,
        status: form.status,
        paymentStatus: form.paymentStatus,
        cancellationReason: form.status === "cancelled" ? form.cancellationReason : undefined,
      })
    } else {
      await onSubmit({ ...basePayload, userId: form.userId ? Number.parseInt(form.userId) : undefined })
    }
  }

  return (
    <CrudForm onSubmit={handleSubmit} onCancel={onCancel} isSaving={isSaving}>
      <FormSection
        title="Cliente Titular"
        className="bg-blue-50/50 p-4 rounded-xl border border-blue-100"
        titleClassName="text-blue-400"
      >
        {initialData ? (
          <div>
            <p className="text-sm font-bold text-blue-900">
              {initialData.user
                ? `${initialData.user.first_name} ${initialData.user.last_name}`
                : `Usuario ID: ${initialData.userId}`}
            </p>
            {initialData.user && <p className="text-xs text-blue-600">{initialData.user.login}</p>}
          </div>
        ) : (
          <SelectField
            label="Seleccionar Cliente Registrado"
            name="userId"
            value={form.userId}
            onChange={handleChange}
            loading={loadingResources}
            placeholder="-- Seleccione un cliente --"
            options={users.map((u) => ({ value: u.id, label: `${u.first_name} ${u.last_name} (${u.login})` }))}
            required
          />
        )}
      </FormSection>

      <FormSection title="Alojamiento" variant="boxed">
        <SelectField
          label="Habitación"
          name="roomId"
          value={form.roomId}
          onChange={handleChange}
          loading={loadingResources}
          placeholder="-- Seleccione una habitación --"
          options={rooms.map((room) => ({
            value: room.id,
            label: `Hab. ${room.roomNumber} - ${room.description} (S/ ${room.pricePerNight})`,
          }))}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Check-In" name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} required />
          <FormField label="Check-Out" name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} required />
        </div>
      </FormSection>

      <hr className="border-[var(--border-color)]" />

      <FormSection title="Detalles y Costos">
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Adultos" name="adults" type="number" min={1} value={form.adults} onChange={handleChange} required />
          <FormField label="Niños" name="children" type="number" min={0} value={form.children} onChange={handleChange} />
          <FormField
            label="Monto Total (Automático)"
            name="totalAmount"
            type="number"
            value={totalAmount.toFixed(2)}
            onChange={() => {}}
            readOnly
            className="bg-gray-100 font-bold cursor-not-allowed"
            hint={
              totalAmount === 0 && (
                <p className="text-[10px] text-orange-500">* Seleccione una habitación para calcular</p>
              )
            }
          />
        </div>
      </FormSection>

      {isEditing && (
        <FormSection
          title="Gestión Admin"
          className="bg-orange-50/50 p-4 rounded-xl border border-orange-100"
          titleClassName="text-orange-400"
        >
          <div className="grid grid-cols-2 gap-4">
            <SelectField
              label="Estado Reserva"
              name="status"
              value={form.status}
              onChange={handleChange}
              options={RESERVATION_STATUS_OPTIONS}
            />
            <SelectField
              label="Estado Pago"
              name="paymentStatus"
              value={form.paymentStatus}
              onChange={handleChange}
              options={PAYMENT_STATUS_OPTIONS}
            />
          </div>
          {form.status === "cancelled" && (
            <FormField
              label="Motivo de Cancelación"
              name="cancellationReason"
              value={form.cancellationReason}
              onChange={handleChange}
              placeholder="Ej. Cliente solicitó cambio..."
            />
          )}
        </FormSection>
      )}

      <TextAreaField
        label="Peticiones Especiales"
        name="specialRequests"
        rows={2}
        value={form.specialRequests}
        onChange={handleChange}
      />
    </CrudForm>
  )
}
