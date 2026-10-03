"use client"

import type React from "react"
import { cloneElement, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Info, Phone } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRoomCatalog } from "@/hooks/useRoomCatalog"
import { BOOKING_PATH, HOTEL } from "@/config/hotel"
import { RESERVATION_STATUS, getStatusConfig, normalizeStatus } from "@/lib/constants/status"
import { parseServerError } from "@/lib/error-parser"
import { reservationService } from "@/lib/services/reservationService"
import type { Reservation } from "@/lib/types/reservation"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { calculateTotalAmount, getNights } from "@/lib/utils/roomUtils"
import { capacityLabel, roomTitle, type CatalogRoom } from "@/lib/utils/roomContent"

const DRAFT_KEY = "illari:booking-draft"
const MANUAL_CONFIRMATION = "Tu solicitud quedará confirmada cuando el hotel verifique la disponibilidad."

const EMPTY_FORM = {
  checkInDate: "",
  checkOutDate: "",
  adults: "1",
  children: "0",
  roomId: "",
  name: "",
  contact: "",
  comment: "",
}

type BookingForm = typeof EMPTY_FORM
type FieldName = keyof BookingForm
type Errors = Partial<Record<FieldName, string>>

// Fecha local "YYYY-MM-DD" (toISOString usaría UTC y en Perú adelantaría el día por la noche)
function localToday(): string {
  return new Date().toLocaleDateString("en-CA")
}

function readDraft(): Partial<BookingForm> {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}")
  } catch {
    return {}
  }
}

function writeDraft(form: BookingForm | null) {
  try {
    if (form) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(form))
    else sessionStorage.removeItem(DRAFT_KEY)
  } catch {
    // sin almacenamiento disponible: el formulario funciona igual
  }
}

function validate(form: BookingForm, room: CatalogRoom | undefined, requireRoom: boolean): Errors {
  const errors: Errors = {}
  const today = localToday()

  if (!form.checkInDate) errors.checkInDate = "Indica la fecha de llegada."
  else if (form.checkInDate < today) errors.checkInDate = "La fecha de llegada no puede ser anterior a hoy."

  if (!form.checkOutDate) errors.checkOutDate = "Indica la fecha de salida."
  else if (form.checkInDate && form.checkOutDate <= form.checkInDate)
    errors.checkOutDate = "La fecha de salida debe ser posterior a la de llegada."

  const adults = Number(form.adults)
  const children = Number(form.children)
  if (!Number.isInteger(adults) || adults < 1) errors.adults = "Debe haber al menos 1 adulto."
  if (!Number.isInteger(children) || children < 0) errors.children = "Indica 0 o más niños."
  else if (room && !errors.adults && adults + children > room.maxOccupancy)
    errors.adults = `Esta habitación admite ${capacityLabel(room.maxOccupancy).toLowerCase()}.`

  if (requireRoom && !form.roomId) errors.roomId = "Elige una habitación para enviar la solicitud en línea."

  if (form.name.trim().length < 2) errors.name = "Escribe tu nombre."

  const contact = form.contact.trim()
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)
  const isPhone = /^\+?[\d\s()-]{6,}$/.test(contact) && contact.replace(/\D/g, "").length >= 6
  if (!contact) errors.contact = "Indica un teléfono o correo para contactarte."
  else if (!isEmail && !isPhone) errors.contact = "Escribe un teléfono (solo números) o un correo válido."

  if (form.comment.length > 500) errors.comment = "El comentario puede tener hasta 500 caracteres."
  return errors
}

export function BookingRequestForm({ initialRoomId }: { initialRoomId?: string }) {
  const { isLoading: authLoading, isLoggedIn, user } = useAuth()
  const { rooms, loading: roomsLoading, error: roomsError } = useRoomCatalog()
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // "phone": el visitante sin cuenta completó el formulario, pero no hay dónde enviarlo en línea
  const [stage, setStage] = useState<"form" | "phone" | "sent">("form")
  const [sentReservation, setSentReservation] = useState<Reservation | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const restored = useRef(false)

  // Recupera el borrador (p. ej. tras iniciar sesión); la habitación de la URL tiene prioridad
  useEffect(() => {
    if (restored.current) return
    restored.current = true
    const draft = readDraft()
    setForm((prev) => ({ ...prev, ...draft, ...(initialRoomId ? { roomId: initialRoomId } : {}) }))
  }, [initialRoomId])

  useEffect(() => {
    if (authLoading || !user) return
    setForm((prev) => ({ ...prev, name: prev.name || user.name, contact: prev.contact || user.email }))
  }, [authLoading, user])

  useEffect(() => {
    if (restored.current && stage === "form") writeDraft(form)
  }, [form, stage])

  const room = rooms.find((r) => String(r.id) === form.roomId)
  const nights = getNights(form.checkInDate, form.checkOutDate)
  const total = room && nights > 0 ? calculateTotalAmount(room.pricePerNight, nights) : null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const name = e.target.name as FieldName
    setForm((prev) => ({ ...prev, [name]: e.target.value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
    setFormError(null)
  }

  const showErrors = (next: Errors, message: string) => {
    setErrors(next)
    setFormError(message)
    // Lleva el foco al primer campo con error
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus())
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const nextErrors = validate(form, room, isLoggedIn)
    if (Object.keys(nextErrors).length > 0) {
      showErrors(nextErrors, "Revisa los campos marcados.")
      return
    }
    setErrors({})
    setFormError(null)

    // Sin cuenta no existe un canal en línea que reciba la solicitud: se ofrece el teléfono
    if (!isLoggedIn || !room) {
      setStage("phone")
      return
    }

    setSubmitting(true)
    try {
      const reservation = await reservationService.create({
        roomId: room.id,
        checkInDate: form.checkInDate,
        checkOutDate: form.checkOutDate,
        adults: Number(form.adults),
        children: Number(form.children),
        totalAmount: calculateTotalAmount(room.pricePerNight, nights),
        // El backend no tiene campos de nombre/contacto: viajan en las solicitudes especiales
        specialRequests: [
          `Nombre: ${form.name.trim()}`,
          `Contacto: ${form.contact.trim()}`,
          form.comment.trim() && `Comentario: ${form.comment.trim()}`,
        ]
          .filter(Boolean)
          .join("\n"),
        aiNotes: "",
      })
      if (!reservation?.id) throw new Error("El servidor no devolvió la solicitud registrada.")
      writeDraft(null)
      setSentReservation(reservation)
      setStage("sent")
    } catch (err) {
      console.error(err)
      const parsed = parseServerError(err)
      showErrors(
        (parsed.fieldErrors ?? {}) as Errors,
        parsed.generalError ??
          "No pudimos enviar tu solicitud. Inténtalo nuevamente o llámanos para consultar disponibilidad."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === "sent" && sentReservation) {
    const confirmed = normalizeStatus(sentReservation.status) === "confirmed"
    return (
      <section aria-live="polite" className="rounded-2xl border border-[var(--illary-line)] bg-white p-6">
        <CheckCircle2 aria-hidden className="h-8 w-8 text-emerald-700" />
        <h2 className="mt-2 font-serif text-2xl text-[var(--illary-ink)]">Solicitud enviada</h2>
        <p className="mt-2 text-[var(--illary-text)]">
          Registramos tu solicitud N.° {sentReservation.id}. Estado:{" "}
          <strong>{getStatusConfig(RESERVATION_STATUS, sentReservation.status).label}</strong>.
        </p>
        {!confirmed && <p className="mt-2 font-medium text-[var(--illary-ink)]">{MANUAL_CONFIRMATION}</p>}
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href="/mis-reservas" className="btn-illary">
            Ver mis reservas
          </Link>
          <a href={HOTEL.phoneHref} className="btn-illary-outline">
            Llamar al hotel
          </a>
        </div>
      </section>
    )
  }

  if (stage === "phone") {
    return (
      <section aria-live="polite" className="rounded-2xl border border-[var(--illary-line)] bg-white p-6">
        <h2 className="font-serif text-2xl text-[var(--illary-ink)]">Tu solicitud aún no se ha enviado</h2>
        <p className="mt-2 text-[var(--illary-text)]">
          Llama al hotel con estos datos para consultar la disponibilidad. {MANUAL_CONFIRMATION}
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-2 rounded-xl bg-[var(--illary-sand)] p-4 text-[var(--illary-ink)] sm:grid-cols-2">
          <SummaryItem label="Llegada" value={formatDate(`${form.checkInDate}T12:00:00`)} />
          <SummaryItem label="Salida" value={formatDate(`${form.checkOutDate}T12:00:00`)} />
          <SummaryItem label="Huéspedes" value={`${form.adults} adulto(s), ${form.children} niño(s)`} />
          <SummaryItem label="Habitación" value={room ? `${roomTitle(room)} (N.° ${room.roomNumber})` : "Sin preferencia"} />
          {total !== null && <SummaryItem label="Total estimado" value={`${formatCurrency(total)} por ${nights} noche(s)`} />}
          <SummaryItem label="Nombre" value={form.name} />
        </dl>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a href={HOTEL.phoneHref} className="btn-illary gap-2">
            <Phone aria-hidden className="h-5 w-5" />
            Llamar al {HOTEL.phoneDisplay}
          </a>
          <button type="button" onClick={() => setStage("form")} className="btn-illary-outline">
            Editar datos
          </button>
        </div>
        <p className="mt-4 text-sm text-[var(--illary-text)]">
          ¿Tienes una cuenta?{" "}
          <Link href={`/login?next=${encodeURIComponent(BOOKING_PATH)}`} className="font-semibold underline">
            Inicia sesión
          </Link>{" "}
          para enviar esta solicitud en línea; conservaremos los datos que ingresaste.
        </p>
      </section>
    )
  }

  const today = localToday()

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="rounded-2xl border border-[var(--illary-line)] bg-white p-5 md:p-6">
      <p className="mb-5 flex items-start gap-2 rounded-lg bg-[var(--illary-sand)] p-3 text-[var(--illary-ink)]">
        <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[var(--illary-primary)]" />
        {MANUAL_CONFIRMATION}
      </p>

      {formError && (
        <p role="alert" className="mb-5 rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">
          {formError}
        </p>
      )}

      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold text-[var(--illary-ink)]">Tu estancia</legend>
        <Field label="Fecha de llegada" name="checkInDate" error={errors.checkInDate}>
          <input type="date" min={today} value={form.checkInDate} onChange={handleChange} required />
        </Field>
        <Field label="Fecha de salida" name="checkOutDate" error={errors.checkOutDate}>
          <input type="date" min={form.checkInDate || today} value={form.checkOutDate} onChange={handleChange} required />
        </Field>
        <Field label="Adultos" name="adults" error={errors.adults}>
          <input type="number" inputMode="numeric" min={1} value={form.adults} onChange={handleChange} required />
        </Field>
        <Field label="Niños" name="children" error={errors.children}>
          <input type="number" inputMode="numeric" min={0} value={form.children} onChange={handleChange} />
        </Field>
        <Field
          label={isLoggedIn ? "Habitación" : "Habitación (opcional)"}
          name="roomId"
          error={errors.roomId ?? (roomsError ? "No pudimos cargar las habitaciones." : undefined)}
          className="sm:col-span-2"
        >
          <select value={form.roomId} onChange={handleChange} disabled={roomsLoading}>
            <option value="">{roomsLoading ? "Cargando habitaciones..." : "Sin preferencia"}</option>
            {rooms.map((r) => (
              <option key={r.id} value={r.id}>
                {roomTitle(r)} · N.° {r.roomNumber} · {capacityLabel(r.maxOccupancy)} · {formatCurrency(r.pricePerNight)} por noche
              </option>
            ))}
          </select>
        </Field>
      </fieldset>

      {room && nights > 0 && total !== null && (
        <div className="mt-5 rounded-xl border border-[var(--illary-line)] p-4" aria-live="polite">
          <h2 className="mb-2 text-base font-semibold text-[var(--illary-ink)]">Resumen de tarifa</h2>
          <dl className="space-y-1 text-[var(--illary-text)]">
            <div className="flex justify-between">
              <dt>Precio por noche</dt>
              <dd>{formatCurrency(room.pricePerNight)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Noches</dt>
              <dd>{nights}</dd>
            </div>
            <div className="flex justify-between border-t border-[var(--illary-line)] pt-2 text-lg font-bold text-[var(--illary-ink)]">
              <dt>Total</dt>
              <dd>{formatCurrency(total)}</dd>
            </div>
          </dl>
        </div>
      )}

      <fieldset className="mt-6 grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold text-[var(--illary-ink)]">Tus datos</legend>
        <Field label="Nombre" name="name" error={errors.name}>
          <input type="text" autoComplete="name" value={form.name} onChange={handleChange} required />
        </Field>
        <Field label="Teléfono o correo electrónico" name="contact" error={errors.contact}>
          <input type="text" autoComplete="email" value={form.contact} onChange={handleChange} required />
        </Field>
        <Field label="Comentario (opcional)" name="comment" error={errors.comment} className="sm:col-span-2">
          <textarea rows={3} maxLength={500} value={form.comment} onChange={handleChange} />
        </Field>
      </fieldset>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={submitting || authLoading} className="btn-illary px-8 text-base">
          {submitting ? "Enviando solicitud..." : isLoggedIn ? "Enviar solicitud" : "Continuar"}
        </button>
        <a href={HOTEL.phoneHref} className="btn-illary-outline gap-2">
          <Phone aria-hidden className="h-5 w-5" />
          Llamar al hotel
        </a>
      </div>
    </form>
  )
}

interface FieldProps {
  label: string
  name: FieldName
  error?: string
  className?: string
  children: React.ReactElement<React.InputHTMLAttributes<HTMLElement>>
}

// Etiqueta + control + error accesible; el control recibe id, name y atributos ARIA
function Field({ label, name, error, className = "", children }: FieldProps) {
  const errorId = `${name}-error`
  const control = cloneElement(children, {
    id: name,
    name,
    "aria-invalid": error ? "true" : "false",
    "aria-describedby": error ? errorId : undefined,
    className: `w-full min-h-11 !text-base ${error ? "!border-red-600" : ""}`,
  })

  return (
    <div className={className}>
      <label htmlFor={name} className="mb-1 block font-medium text-[var(--illary-ink)]">
        {label}
      </label>
      {control}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-[var(--illary-text)]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  )
}
