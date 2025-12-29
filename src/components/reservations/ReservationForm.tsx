"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { Reservation, ReservationAdmin, ReservationPayload, ReservationUpdatePayload } from "@/lib/types/reservation"
import { roomService } from "@/lib/services/roomService"
import { userService } from "@/lib/services/userService"
import type { UserOption } from "@/lib/types/user"
import type { Room } from "@/lib/types/room"

interface ReservationFormProps {
  initialData: Reservation | ReservationAdmin
  onSubmit: (data: ReservationPayload | ReservationUpdatePayload) => Promise<void> | void
  onCancel: () => void
  isSaving: boolean
  isEditing: boolean
}

export function ReservationForm({ initialData, onSubmit, onCancel, isSaving, isEditing }: ReservationFormProps) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<UserOption[]>([]) 
  const [loadingResources, setLoadingResources] = useState(true)

  // ESTADO INICIAL BLINDADO
  // Si es nueva reserva, roomId nace estrictamente como cadena vacía ""
  const [form, setForm] = useState({
    userId: 'user' in initialData ? (initialData as ReservationAdmin).userId?.toString() : "", 
    roomId: initialData.roomId?.toString() || "", 
    checkInDate: initialData.checkInDate?.split('T')[0] || "",
    checkOutDate: initialData.checkOutDate?.split('T')[0] || "",
    adults: initialData.adults?.toString() || "1",
    children: initialData.children?.toString() || "0",
    totalAmount: initialData.totalAmount?.toString() || "0",
    specialRequests: initialData.specialRequests || "",
    aiNotes: initialData.aiNotes || "",
    status: initialData.status || "confirmed",
    paymentStatus: initialData.paymentStatus || "pending",
    cancellationReason: initialData.cancellationReason || ""
  })

  const clientInfo = 'user' in initialData ? (initialData as ReservationAdmin).user : null

  // 1. Carga de Recursos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsData, usersData] = await Promise.all([
          roomService.list(),
          !isEditing ? userService.list() : Promise.resolve([]) 
        ])
        setRooms(roomsData)
        setUsers(usersData)
        // NOTA: Eliminamos cualquier autoselección aquí.
      } catch (e) {
        console.error("Error cargando recursos", e)
      } finally {
        setLoadingResources(false)
      }
    }
    fetchData()
  }, [isEditing])

  // 🆕 2. CALCULADORA MATEMÁTICA EXACTA
  useEffect(() => {
    // Si no hay habitación REALMENTE seleccionada (no solo visual), abortamos
    if (!form.roomId || !form.checkInDate || !form.checkOutDate) return
    
    const selectedRoom = rooms.find(r => r.id.toString() === form.roomId)
    if (!selectedRoom) return

    // TRUCO: Usamos split para crear fechas sin horas ni zonas horarias (UTC vs Local)
    // Esto evita que 1 día se convierta en 0.99 días y dé cero.
    const parseDate = (str: string) => {
        const [year, month, day] = str.split('-').map(Number)
        return new Date(year, month - 1, day).getTime()
    }

    const start = parseDate(form.checkInDate)
    const end = parseDate(form.checkOutDate)

    if (end <= start) return 

    // Diferencia en milisegundos exactos
    const diffMs = end - start
    // Convertir a días y REDONDEAR (Math.round es clave aquí)
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (days > 0) {
        const price = Number(selectedRoom.pricePerNight)
        const total = (days * price).toFixed(2)
        
        // Solo actualizamos si cambia para evitar loops
        setForm(prev => {
            if (prev.totalAmount === total) return prev
            return { ...prev, totalAmount: total }
        })
    }
  }, [form.roomId, form.checkInDate, form.checkOutDate, rooms])


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Validación extra antes de enviar
    if (!form.roomId) {
        alert("Por favor selecciona una habitación válida")
        return
    }

    const basePayload = {
      roomId: Number.parseInt(form.roomId),
      checkInDate: form.checkInDate,
      checkOutDate: form.checkOutDate,
      adults: Number.parseInt(form.adults),
      children: Number.parseInt(form.children),
      totalAmount: Number.parseFloat(form.totalAmount),
      specialRequests: form.specialRequests,
      aiNotes: form.aiNotes,
    }

    if (isEditing) {
      const updatePayload: ReservationUpdatePayload = {
        ...basePayload,
        status: form.status,
        paymentStatus: form.paymentStatus,
        cancellationReason: form.status === 'cancelled' ? form.cancellationReason : undefined
      }
      await onSubmit(updatePayload)
    } else {
      const createPayload: ReservationPayload = {
        ...basePayload,
        userId: form.userId ? Number.parseInt(form.userId) : undefined
      }
      await onSubmit(createPayload)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      
      {/* SECCIÓN CLIENTE */}
      <div className="space-y-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
        <h3 className="text-xs font-bold uppercase text-blue-400 tracking-wider">Cliente Titular</h3>
        
        {isEditing ? (
           <div className="flex items-center gap-3">
             <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             </div>
             <div>
                <p className="text-sm font-bold text-blue-900">
                  {clientInfo ? `${clientInfo.first_name} ${clientInfo.last_name}` : `Usuario ID: ${initialData.userId}`}
                </p>
                {clientInfo && <p className="text-xs text-blue-600">{clientInfo.login}</p>}
             </div>
           </div>
        ) : (
           <div className="space-y-1.5">
             <label className="text-xs font-medium text-[var(--color-600)]">Seleccionar Cliente Registrado</label>
             {loadingResources ? (
                <div className="text-xs text-gray-400">Cargando lista de clientes...</div>
             ) : (
               <select
                 name="userId"
                 value={form.userId}
                 onChange={handleChange}
                 required
                 className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
               >
                 <option value="">-- Seleccione un cliente --</option>
                 {users.map(u => (
                   <option key={u.id} value={u.id}>
                     {u.first_name} {u.last_name} ({u.login})
                   </option>
                 ))}
               </select>
             )}
           </div>
        )}
      </div>

      {/* SECCIÓN ALOJAMIENTO */}
      <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Alojamiento</h3>
        
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-600)]">Habitación</label>
            {loadingResources ? (
                <div className="text-xs text-gray-400">Cargando habitaciones...</div>
            ) : (
                <select
                    name="roomId"
                    value={form.roomId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
                >
                    {/* 👇 ESTA ES LA CLAVE: Opción vacía explícita sin 'disabled' para obligar a elegir */}
                    <option value="">-- Seleccione una habitación --</option>
                    
                    {rooms.map(room => (
                        <option key={room.id} value={room.id}>
                           Hab. {room.roomNumber} - {room.description} (S/ {room.pricePerNight})
                        </option>
                    ))}
                </select>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Check-In" name="checkInDate" type="date" value={form.checkInDate} onChange={handleChange} required />
          <FormField label="Check-Out" name="checkOutDate" type="date" value={form.checkOutDate} onChange={handleChange} required />
        </div>
      </div>

      <hr className="border-[var(--border-color)]" />

      {/* SECCIÓN COSTOS */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase text-[var(--color-400)] tracking-wider">Detalles y Costos</h3>
        <div className="grid grid-cols-3 gap-4">
          <FormField label="Adultos" name="adults" type="number" value={form.adults} onChange={handleChange} required />
          <FormField label="Niños" name="children" type="number" value={form.children} onChange={handleChange} />
          
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-600)]">Monto Total (Automático)</label>
            <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500 font-bold">S/</span>
                <input
                    type="number"
                    name="totalAmount"
                    value={form.totalAmount}
                    readOnly
                    className="w-full rounded-xl border border-[var(--border-color)] bg-gray-100 pl-8 pr-3 py-2 text-sm 
                            text-[var(--dark-color)] font-bold focus:outline-none cursor-not-allowed"
                />
            </div>
            {/* Mensaje de ayuda si es 0 */}
            {Number(form.totalAmount) === 0 && form.checkInDate && form.checkOutDate && (
                <p className="text-[10px] text-orange-500">
                    * Seleccione una habitación para calcular
                </p>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN ADMIN */}
      {isEditing && (
        <div className="space-y-4 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
            <h3 className="text-xs font-bold uppercase text-orange-400 tracking-wider">Gestión Admin</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--color-600)]">Estado Reserva</label>
                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                        <option value="confirmed">Confirmada</option>
                        <option value="cancelled">Cancelada</option>
                        <option value="checked_in">Check-In Realizado</option>
                        <option value="checked_out">Finalizada</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[var(--color-600)]">Estado Pago</label>
                    <select
                        name="paymentStatus"
                        value={form.paymentStatus}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="refunded">Reembolsado</option>
                    </select>
                </div>
            </div>
            
            {form.status === 'cancelled' && (
                 <FormField 
                    label="Motivo de Cancelación" 
                    name="cancellationReason" 
                    value={form.cancellationReason} 
                    onChange={handleChange} 
                    placeholder="Ej. Cliente solicitó cambio..."
                />
            )}
        </div>
      )}

      {/* SECCIÓN NOTAS */}
      <div className="space-y-4">
        <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--color-600)]">Peticiones Especiales</label>
            <textarea
                name="specialRequests"
                value={form.specialRequests}
                onChange={handleChange}
                rows={2}
                className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
            />
        </div>
      </div>

      <FormActions onCancel={onCancel} isSaving={isSaving} />
    </form>
  )
}

// Helpers
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
        className="w-full rounded-xl border border-[var(--border-color)] bg-white px-3 py-2 text-sm 
                   text-[var(--dark-color)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/40"
      />
    </div>
  )
}

function FormActions({ onCancel, isSaving }: { onCancel: () => void; isSaving: boolean }) {
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
        {isSaving ? "Guardando..." : "Guardar"}
      </button>
    </div>
  )
}