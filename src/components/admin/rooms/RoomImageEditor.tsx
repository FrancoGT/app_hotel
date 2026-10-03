"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { FormField, FormSection } from "@/components/forms/fields"
import { imageService } from "@/lib/services/imageService"
import type { Image as RoomImage } from "@/lib/types/image"

interface RoomImageEditorProps {
  roomId: number
  roomNumber: string
}

// Imagen principal de una habitación ya creada. Se guarda de forma independiente al formulario.
export function RoomImageEditor({ roomId, roomNumber }: RoomImageEditorProps) {
  const [currentImage, setCurrentImage] = useState<RoomImage | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [busy, setBusy] = useState<"saving" | "deleting" | null>(null)
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null)

  useEffect(() => {
    imageService
      .listByEntity("room", roomId)
      .then((images) => {
        const main = images.find((img) => img.is_main) ?? images[0]
        if (!main) return
        setCurrentImage(main)
        setImageUrl(main.url)
        setImageAlt(main.alt_text ?? "")
      })
      .catch(() => {
        // Sin imagen: se muestra el formulario vacío
      })
  }, [roomId])

  const handleSave = async () => {
    if (!imageUrl.trim()) {
      setFeedback({ type: "error", message: "La URL no puede estar vacía." })
      return
    }
    setFeedback(null)
    setBusy("saving")
    try {
      const data = { url: imageUrl.trim(), alt_text: imageAlt.trim() || undefined }
      const saved = currentImage
        ? await imageService.update(currentImage.id, data)
        : await imageService.create({ ...data, entity_type: "room", entity_id: roomId, is_main: true, position: 0 })
      setCurrentImage(saved)
      setFeedback({ type: "success", message: "Imagen guardada correctamente." })
    } catch {
      setFeedback({ type: "error", message: "Error al guardar la imagen. Verifica la URL." })
    } finally {
      setBusy(null)
    }
  }

  const handleDelete = async () => {
    if (!currentImage) return
    setFeedback(null)
    setBusy("deleting")
    try {
      await imageService.delete(currentImage.id)
      setCurrentImage(null)
      setImageUrl("")
      setImageAlt("")
      setFeedback({ type: "success", message: "Imagen eliminada." })
    } catch {
      setFeedback({ type: "error", message: "Error al eliminar la imagen." })
    } finally {
      setBusy(null)
    }
  }

  return (
    <FormSection title="Imagen de la Habitación">
      {currentImage && (
        <div className="relative w-full h-40 rounded-xl overflow-hidden border border-[var(--border-color)]">
          <Image
            src={currentImage.url}
            alt={currentImage.alt_text ?? `Habitación ${roomNumber}`}
            fill
            className="object-cover"
            sizes="100%"
          />
        </div>
      )}

      <div className="space-y-3">
        <FormField
          label="URL de la imagen"
          name="imageUrl"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://ejemplo.com/imagen.jpg"
        />
        <FormField
          label="Texto alternativo (alt)"
          name="imageAlt"
          value={imageAlt}
          onChange={(e) => setImageAlt(e.target.value)}
          placeholder="Ej: Vista de la habitación doble"
        />

        {feedback && (
          <p className={feedback.type === "error" ? "text-xs text-red-500" : "text-xs text-emerald-600"}>
            {feedback.message}
          </p>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={busy !== null}
            className="inline-flex items-center justify-center rounded-xl bg-[var(--primary-color)] px-4 py-2 text-xs font-medium text-white hover:brightness-110 disabled:opacity-70"
          >
            {busy === "saving" ? "Guardando..." : currentImage ? "Actualizar imagen" : "Guardar imagen"}
          </button>
          {currentImage && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={busy !== null}
              className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-70"
            >
              {busy === "deleting" ? "Eliminando..." : "Eliminar imagen"}
            </button>
          )}
        </div>
      </div>
    </FormSection>
  )
}
