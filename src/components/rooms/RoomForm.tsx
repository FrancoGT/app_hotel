"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Room, RoomPayload } from "@/lib/types/room"
import { establishmentService } from "@/lib/services/establishmentService" // Asegúrate de la ruta
import { roomTypeService, type RoomType } from "@/lib/services/roomTypeService" // El nuevo servicio
import type { Establishment } from "@/lib/types/establishment"

interface RoomFormProps {
  initialData: Room
  onSubmit: (data: RoomPayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
}

type FormState = {
  roomNumber: string
  floor: string
  status: string
  maxOccupancy: string
  pricePerNight: string
  description: string
  features: string
  establishmentId: string
  roomTypeId: string
}

export function RoomForm({ initialData, onSubmit, onCancel, isSaving }: RoomFormProps) {
  // 1. Estado para guardar las listas que vienen de la BD
  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [form, setForm] = useState<FormState>({
    roomNumber: initialData.roomNumber ?? "",
    floor: initialData.floor?.toString() ?? "1",
    status: initialData.status ?? "available",
    maxOccupancy: initialData.maxOccupancy?.toString() ?? "2",
    pricePerNight: initialData.pricePerNight?.toString() ?? "0",
    description: initialData.description ?? "",
    features: initialData.features ? initialData.features.join(", ") : "",
    // Inicializamos con el ID que venga o vacio
    establishmentId: initialData.establishmentId?.toString() ?? "",
    roomTypeId: initialData.roomTypeId?.toString() ?? "",
  })

  // 2. Cargar los datos reales al iniciar el componente
  useEffect(() => {
    const loadSelectOptions = async () => {
      try {
        const [ests, types] = await Promise.all([
            establishmentService.list(),
            roomTypeService.list()
        ])
        setEstablishments(ests)
        setRoomTypes(types)
        
        // Si es una creación nueva (no edición) y no hay ID seleccionado,
        // seleccionamos el primero de la lista por defecto para ayudar al usuario
        setForm(prev => ({
            ...prev,
            establishmentId: prev.establishmentId || (ests[0]?.id.toString() ?? ""),
            roomTypeId: prev.roomTypeId || (types[0]?.id.toString() ?? "")
        }))

      } catch (error) {
        console.error("Error cargando listas:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    loadSelectOptions()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const featuresArray = form.features
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f !== "")

    const payload: RoomPayload = {
      roomNumber: form.roomNumber,
      floor: Number.parseInt(form.floor) || 1,
      status: form.status,
      maxOccupancy: Number.parseInt(form.maxOccupancy) || 1,
      pricePerNight: Number.parseFloat(form.pricePerNight) || 0,
      description: form.description,
      features: featuresArray,
      // Aquí convertimos el string del select a número para la API
      establishmentId: Number.parseInt(form.establishmentId),
      roomTypeId: Number.parseInt(form.roomTypeId),
      createdBy: 0, 
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      
      {/* SECCIÓN: VINCULACIÓN (SELECTORES REALES) */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Ubicación y Tipo</h3>
        
        {isLoadingData ? (
            <p className="text-xs text-gray-500">Cargando opciones...</p>
        ) : (
            <div className="grid grid-cols-2 gap-4">
            {/* SELECTOR DE ESTABLECIMIENTO */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-600)]">Establecimiento (Hotel)</label>
                <select
                    name="establishmentId"
                    value={form.establishmentId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                >
                    <option value="" disabled>Selecciona un hotel</option>
                    {establishments.map(est => (
                        <option key={est.id} value={est.id}>
                            {est.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* SELECTOR DE TIPO DE HABITACIÓN */}
            <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-600)]">Tipo de Habitación</label>
                <select
                    name="roomTypeId"
                    value={form.roomTypeId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                >
                    <option value="" disabled>Selecciona un tipo</option>
                    {roomTypes.map(type => (
                        <option key={type.id} value={type.id}>
                            {type.name}
                        </option>
                    ))}
                </select>
            </div>
            </div>
        )}
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN: DATOS DE LA HABITACIÓN */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Detalles</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField 
            label="Número de Habitación" 
            name="roomNumber" 
            value={form.roomNumber} 
            onChange={handleChange} 
            required 
            placeholder="Ej. 101"
          />
          <FormField 
            label="Piso" 
            name="floor" 
            type="number" 
            value={form.floor} 
            onChange={handleChange} 
            required 
          />
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

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-600)]">Estado Actual</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
          >
            <option value="available">Disponible</option>
            <option value="occupied">Ocupada</option>
            <option value="maintenance">En Mantenimiento</option>
            <option value="cleaning">Limpieza</option>
          </select>
        </div>
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN: DESCRIPCIÓN */}
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-600)]">Descripción General</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--color-600)]">Características</label>
          <input
            type="text"
            name="features"
            value={form.features}
            onChange={handleChange}
            placeholder="Ej: Wifi, TV Cable"
            className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
          />
        </div>
      </div>

      <FormActions onCancel={onCancel} isSaving={isSaving} />
    </form>
  )
}

// --- COMPONENTES AUXILIARES ---
// (Mantén tus componentes FormField y FormActions aquí abajo igual que antes)
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
        {isSaving ? "Guardando…" : "Guardar"}
      </button>
    </div>
  )
}