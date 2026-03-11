"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import type { Room, RoomPayload } from "@/lib/types/room"
import { establishmentService } from "@/lib/services/establishmentService"
import { roomTypeService, type RoomType } from "@/lib/services/roomTypeService"
import { imageService } from "@/lib/services/imageService"
import type { Establishment } from "@/lib/types/establishment"
import type { Image as RoomImage } from "@/lib/types/image"

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
  const isEditing = initialData.id > 0

  const [establishments, setEstablishments] = useState<Establishment[]>([])
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([])
  const [isLoadingData, setIsLoadingData] = useState(true)

  // Estado de imagen
  const [currentImage, setCurrentImage] = useState<RoomImage | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [isSavingImage, setIsSavingImage] = useState(false)
  const [isDeletingImage, setIsDeletingImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [imageSuccess, setImageSuccess] = useState<string | null>(null)

  const [form, setForm] = useState<FormState>({
    roomNumber: initialData.roomNumber ?? "",
    floor: initialData.floor?.toString() ?? "1",
    status: initialData.status ?? "available",
    maxOccupancy: initialData.maxOccupancy?.toString() ?? "2",
    pricePerNight: initialData.pricePerNight?.toString() ?? "0",
    description: initialData.description ?? "",
    features: initialData.features ? initialData.features.join(", ") : "",
    establishmentId: initialData.establishmentId?.toString() ?? "",
    roomTypeId: initialData.roomTypeId?.toString() ?? "",
  })

  useEffect(() => {
    const loadSelectOptions = async () => {
      try {
        const [ests, types] = await Promise.all([
          establishmentService.list(),
          roomTypeService.list(),
        ])
        setEstablishments(ests)
        setRoomTypes(types)
        setForm((prev) => ({
          ...prev,
          establishmentId: prev.establishmentId || (ests[0]?.id.toString() ?? ""),
          roomTypeId: prev.roomTypeId || (types[0]?.id.toString() ?? ""),
        }))
      } catch (error) {
        console.error("Error cargando listas:", error)
      } finally {
        setIsLoadingData(false)
      }
    }
    loadSelectOptions()
  }, [])

  // Cargar imagen existente si es edición
  useEffect(() => {
    if (!isEditing) return
    const loadImage = async () => {
      try {
        const images = await imageService.listByEntity("room", initialData.id)
        const main = images.find((img) => img.is_main) ?? images[0] ?? null
        if (main) {
          setCurrentImage(main)
          setImageUrl(main.url)
          setImageAlt(main.alt_text ?? "")
        }
      } catch {
        // sin imagen, no pasa nada
      }
    }
    loadImage()
  }, [isEditing, initialData.id])

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
      establishmentId: Number.parseInt(form.establishmentId),
      roomTypeId: Number.parseInt(form.roomTypeId),
      createdBy: 0,
    }
    await onSubmit(payload)
  }

  const handleSaveImage = async () => {
    if (!imageUrl.trim()) {
      setImageError("La URL no puede estar vacía.")
      return
    }
    setImageError(null)
    setImageSuccess(null)
    setIsSavingImage(true)
    try {
      if (currentImage) {
        // Actualizar imagen existente
        const updated = await imageService.update(currentImage.id, {
          url: imageUrl.trim(),
          alt_text: imageAlt.trim() || undefined,
        })
        setCurrentImage(updated)
      } else {
        // Crear imagen nueva
        const created = await imageService.create({
          entity_type: "room",
          entity_id: initialData.id,
          url: imageUrl.trim(),
          alt_text: imageAlt.trim() || undefined,
          is_main: true,
          position: 0,
        })
        setCurrentImage(created)
      }
      setImageSuccess("Imagen guardada correctamente.")
    } catch {
      setImageError("Error al guardar la imagen. Verifica la URL.")
    } finally {
      setIsSavingImage(false)
    }
  }

  const handleDeleteImage = async () => {
    if (!currentImage) return
    setIsDeletingImage(true)
    setImageError(null)
    setImageSuccess(null)
    try {
      await imageService.delete(currentImage.id)
      setCurrentImage(null)
      setImageUrl("")
      setImageAlt("")
      setImageSuccess("Imagen eliminada.")
    } catch {
      setImageError("Error al eliminar la imagen.")
    } finally {
      setIsDeletingImage(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">

      {/* SECCIÓN: VINCULACIÓN */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Ubicación y Tipo</h3>
        {isLoadingData ? (
          <p className="text-xs text-gray-500">Cargando opciones...</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
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
                {establishments.map((est) => (
                  <option key={est.id} value={est.id}>{est.name}</option>
                ))}
              </select>
            </div>
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
                {roomTypes.map((type) => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN: DETALLES */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Detalles</h3>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Número de Habitación" name="roomNumber" value={form.roomNumber} onChange={handleChange} required placeholder="Ej. 101" />
          <FormField label="Piso" name="floor" type="number" value={form.floor} onChange={handleChange} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Precio por Noche (S/)" name="pricePerNight" type="number" step="0.01" value={form.pricePerNight} onChange={handleChange} required />
          <FormField label="Capacidad Máxima" name="maxOccupancy" type="number" value={form.maxOccupancy} onChange={handleChange} required />
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

      {/* SECCIÓN: IMAGEN — solo en edición */}
      {isEditing && (
        <>
          <hr className="border-[var(--border-color)]" />
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Imagen de la Habitación</h3>

            {/* Preview */}
            {currentImage && (
              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[var(--border-color)]">
                <Image
                  src={currentImage.url}
                  alt={currentImage.alt_text ?? `Habitación ${initialData.roomNumber}`}
                  fill
                  className="object-cover"
                  sizes="100%"
                />
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-600)]">URL de la imagen</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[var(--color-600)]">Texto alternativo (alt)</label>
                <input
                  type="text"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Ej: Vista de la habitación doble"
                  className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                />
              </div>

              {/* Feedback */}
              {imageError && (
                <p className="text-xs text-red-500">{imageError}</p>
              )}
              {imageSuccess && (
                <p className="text-xs text-emerald-600">{imageSuccess}</p>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveImage}
                  disabled={isSavingImage}
                  className="inline-flex items-center justify-center rounded-xl bg-[var(--primary-color)] px-4 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-70"
                >
                  {isSavingImage ? "Guardando..." : currentImage ? "Actualizar imagen" : "Guardar imagen"}
                </button>

                {currentImage && (
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={isDeletingImage}
                    className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-70"
                  >
                    {isDeletingImage ? "Eliminando..." : "Eliminar imagen"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {!isEditing && (
        <p className="text-xs text-[var(--color-400)] bg-slate-50 rounded-xl px-4 py-3 border border-slate-200">
          💡 Podrás agregar una imagen después de crear la habitación, al editarla.
        </p>
      )}

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
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  placeholder?: string
  step?: string
}

function FormField({ label, name, value, type = "text", onChange, required, placeholder, step }: FormFieldProps) {
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
        className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
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
        className="inline-flex items-center justify-center rounded-xl border border-[var(--border-color)] px-4 py-2 text-xs font-medium text-[var(--dark-color)] hover:bg-[var(--body-color)]/60 disabled:opacity-60"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex items-center justify-center rounded-xl bg-[var(--primary-color)] px-4 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-70"
      >
        {isSaving ? "Guardando…" : "Guardar"}
      </button>
    </div>
  )
}