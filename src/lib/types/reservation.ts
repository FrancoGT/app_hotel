// types/reservation.ts

// ==========================================
// 0. Tipos Auxiliares
// ==========================================

// Datos del cliente que vienen desde el backend para el Admin
export interface UserInfo {
  id: number
  first_name: string
  last_name: string
  login: string        // Correo electrónico
  telephone?: string
}

// ==========================================
// 1. Base común (Los campos básicos de la reserva)
// ==========================================
export interface ReservationBase {
  roomId: number
  checkInDate: string // string "YYYY-MM-DD"
  checkOutDate: string // string "YYYY-MM-DD"
  adults: number
  children?: number
  totalAmount: number
  specialRequests?: string
  aiNotes?: string
}

// ==========================================
// 2. Payload para CREAR (Lo que envía el Cliente o Admin)
// ==========================================
export interface ReservationData extends ReservationBase {
  // 🆕 NUEVO: ID del usuario al que se le asigna la reserva.
  // Es opcional porque el cliente normal no lo envía (se auto-asigna),
  // pero el Admin sí lo envía.
  userId?: number
}
export type ReservationPayload = ReservationData; 

// ==========================================
// 3. Payload para ACTUALIZAR (Lo que envía el Admin)
// ==========================================
export interface ReservationUpdatePayload extends Partial<ReservationBase> {
  status?: string          // Ej: "cancelled", "confirmed"
  paymentStatus?: string   // Ej: "paid", "refunded"
  cancellationReason?: string
}

// ==========================================
// 4. La Reserva Estándar (Respuesta normal)
// ==========================================
// Esta es la que recibe el cliente en "/reservations/my" o "/reservations/{id}"
export interface Reservation extends ReservationBase {
  id: number
  userId: number
  status: string
  paymentStatus: string
  cancellationReason?: string
  createdAt: string // ISO string
  updatedAt: string // ISO string
}

// ==========================================
// 5. La Reserva Admin (Respuesta enriquecida)
// ==========================================
// Esta es la que recibes en "/reservations/all".
// Extiende la reserva normal y agrega el objeto 'user'.
// `user` falta en las reservas recién creadas/actualizadas hasta que se recarga la lista
export interface ReservationAdmin extends Reservation {
  user?: UserInfo
}
