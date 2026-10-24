"use client"

import type React from "react"
import { cloneElement, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { CheckCircle2, Info, Phone, UserRound } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRoomCatalog } from "@/hooks/useRoomCatalog"
import { BOOKING_PATH, HOTEL } from "@/config/hotel"
import { PAYMENT_STATUS, RESERVATION_STATUS, getStatusConfig } from "@/lib/constants/status"
import { parseServerError } from "@/lib/error-parser"
import { ApiError } from "@/lib/http"
import { reservationService } from "@/lib/services/reservationService"
import type { Reservation } from "@/lib/types/reservation"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { calculateTotalAmount, getNights } from "@/lib/utils/roomUtils"
import { capacityLabel, roomTitle, type CatalogRoom } from "@/lib/utils/roomContent"

const DRAFT_KEY = "illari:booking-draft"
// POST /reservations/ exige token: un visitante sin cuenta no puede reservar en línea
const LOGIN_REQUIRED = "Para reservar en línea necesitas iniciar sesión con tu cuenta."
const PAYMENT_NOTE = "El pago se coordina con el hotel; la reserva queda con el pago pendiente hasta entonces."
const AUTH_NEXT = encodeURIComponent(BOOKING_PATH)

const EMPTY_FORM = {
  checkInDate: "",
  checkOutDate: "",
  adults: "1",
  children: "0",
  roomId: "",
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

function validate(form: BookingForm, room: CatalogRoom | undefined): Errors {
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

  // El backend reserva una habitación concreta: roomId es obligatorio
  if (!form.roomId) errors.roomId = "Elige una habitación."

  if (form.comment.length > 500) errors.comment = "El comentario puede tener hasta 500 caracteres."
  return errors
}

export function BookingRequestForm({ initialRoomId }: { initialRoomId?: string }) {
  const { isLoading: authLoading, isLoggedIn, user, logout } = useAuth()
  const { rooms, loading: roomsLoading, error: roomsError } = useRoomCatalog()
  const [form, setForm] = useState<BookingForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Errors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // "auth": visitante sin cuenta (o con la sesión vencida); debe iniciar sesión o registrarse
  const [stage, setStage] = useState<"form" | "auth" | "sent">("form")
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
    const nextErrors = validate(form, room)
    if (Object.keys(nextErrors).length > 0) {
      showErrors(nextErrors, "Revisa los campos marcados.")
      return
    }
    setErrors({})
    setFormError(null)

    // El borrador queda en sessionStorage para retomarlo tras iniciar sesión o registrarse
    if (!isLoggedIn || !room) {
      setStage("auth")
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
        // La API no calcula el total: lo envía el cliente
        totalAmount: calculateTotalAmount(room.pricePerNight, nights),
        // Sin userId (la reserva queda a nombre del token) ni aiNotes (lo completa el modelo de IA)
        specialRequests: form.comment.trim() || undefined,
      })
      if (!reservation?.id) throw new Error("El servidor no devolvió la reserva registrada.")
      writeDraft(null)
      setSentReservation(reservation)
      setStage("sent")
    } catch (err) {
      console.error(err)
      // El token dura 15 minutos: si venció, se pide iniciar sesión otra vez conservando el borrador
      if (err instanceof ApiError && err.status === 401) {
        await logout()
        setStage("auth")
        return
      }
      if (err instanceof ApiError && err.status === 409) {
        showErrors(
          { roomId: "Esta habitación ya está reservada en esas fechas." },
          "La habitación no está disponible en las fechas elegidas. Prueba otras fechas u otra habitación."
        )
        return
      }
      const parsed = parseServerError(err)
      showErrors(
        (parsed.fieldErrors ?? {}) as Errors,
        parsed.generalError ??
          "No pudimos registrar tu reserva. Inténtalo nuevamente o llámanos para consultar disponibilidad."
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (stage === "sent" && sentReservation) {
    return (
      <section aria-live="polite" className="rounded-2xl border border-[var(--illary-line)] bg-white p-6">
        <CheckCircle2 aria-hidden className="h-8 w-8 text-emerald-700" />
        <h2 className="mt-2 font-serif text-2xl text-[var(--illary-ink)]">Reserva registrada</h2>
        <p className="mt-2 text-[var(--illary-text)]">
          Registramos tu reserva N.° {sentReservation.id}. Estado:{" "}
          <strong>{getStatusConfig(RESERVATION_STATUS, sentReservation.status).label}</strong> · Pago:{" "}
          <strong>{getStatusConfig(PAYMENT_STATUS, sentReservation.paymentStatus).label}</strong>.
        </p>
        <p className="mt-2 font-medium text-[var(--illary-ink)]">{PAYMENT_NOTE}</p>
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

  if (stage === "auth") {
    return (
      <section aria-live="polite" className="rounded-2xl border border-[var(--illary-line)] bg-white p-6">
        <UserRound aria-hidden className="h-8 w-8 text-[var(--illary-primary)]" />
        <h2 className="mt-2 font-serif text-2xl text-[var(--illary-ink)]">Inicia sesión para reservar</h2>
        <p className="mt-2 text-[var(--illary-text)]">
          {LOGIN_REQUIRED} Si aún no tienes una cuenta, puedes crearla ahora. Conservaremos los datos que ingresaste.
        </p>
        <dl className="mt-4 grid gap-x-6 gap-y-2 rounded-xl bg-[var(--illary-sand)] p-4 text-[var(--illary-ink)] sm:grid-cols-2">
          <SummaryItem label="Llegada" value={formatDate(`${form.checkInDate}T12:00:00`)} />
          <SummaryItem label="Salida" value={formatDate(`${form.checkOutDate}T12:00:00`)} />
          <SummaryItem label="Huéspedes" value={`${form.adults} adulto(s), ${form.children} niño(s)`} />
          {room && <SummaryItem label="Habitación" value={`${roomTitle(room)} (N.° ${room.roomNumber})`} />}
          {total !== null && <SummaryItem label="Total estimado" value={`${formatCurrency(total)} por ${nights} noche(s)`} />}
        </dl>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Link href={`/login?next=${AUTH_NEXT}`} className="btn-illary">
            Iniciar sesión
          </Link>
          <Link href={`/register?next=${AUTH_NEXT}`} className="btn-illary-outline">
            Crear cuenta
          </Link>
          <button type="button" onClick={() => setStage("form")} className="btn-illary-outline">
            Editar datos
          </button>
        </div>
        <p className="mt-4 text-sm text-[var(--illary-text)]">
          ¿Prefieres no crear una cuenta? Llámanos al{" "}
          <a href={HOTEL.phoneHref} className="font-semibold underline">
            {HOTEL.phoneDisplay}
          </a>{" "}
          para reservar por teléfono.
        </p>
      </section>
    )
  }

  const today = localToday()

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="rounded-2xl border border-[var(--illary-line)] bg-white p-5 md:p-6">
      <p className="mb-5 flex items-start gap-2 rounded-lg bg-[var(--illary-sand)] p-3 text-[var(--illary-ink)]">
        <Info aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-[var(--illary-primary)]" />
        {isLoggedIn ? (
          <span>
            Reservas como <strong>{user?.name}</strong>. {PAYMENT_NOTE}
          </span>
        ) : (
          <span>
            {LOGIN_REQUIRED}{" "}
            <Link href={`/login?next=${AUTH_NEXT}`} className="font-semibold underline">
              Inicia sesión
            </Link>{" "}
            o{" "}
            <Link href={`/register?next=${AUTH_NEXT}`} className="font-semibold underline">
              crea una cuenta
            </Link>
            ; conservaremos los datos que ingreses aquí.
          </span>
        )}
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
          label="Habitación"
          name="roomId"
          error={errors.roomId ?? (roomsError ? "No pudimos cargar las habitaciones." : undefined)}
          className="sm:col-span-2"
        >
          <select value={form.roomId} onChange={handleChange} disabled={roomsLoading} required>
            <option value="">{roomsLoading ? "Cargando habitaciones..." : "Elige una habitación"}</option>
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

      <fieldset className="mt-6 grid gap-4">
        <legend className="mb-3 text-lg font-semibold text-[var(--illary-ink)]">Solicitudes especiales</legend>
        <Field label="Comentario (opcional)" name="comment" error={errors.comment}>
          <textarea rows={3} maxLength={500} value={form.comment} onChange={handleChange} />
        </Field>
      </fieldset>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button type="submit" disabled={submitting || authLoading} className="btn-illary px-8 text-base">
          {submitting ? "Registrando reserva..." : isLoggedIn ? "Reservar" : "Continuar"}
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
