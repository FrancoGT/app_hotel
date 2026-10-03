import { apiFetch, toArray } from "@/lib/http"
import type {
  Reservation,
  ReservationAdmin,
  ReservationPayload,
  ReservationUpdatePayload,
} from "@/lib/types/reservation"

export const reservationService = {
  // Admin: todas las reservas, con los datos del cliente
  listAll: async (): Promise<ReservationAdmin[]> =>
    toArray<ReservationAdmin>(await apiFetch("/reservations/all")),

  // Cliente: solo las reservas del usuario autenticado
  listMy: async (): Promise<Reservation[]> => toArray<Reservation>(await apiFetch("/reservations/my")),

  getById: (id: number) => apiFetch<Reservation>(`/reservations/${id}`),

  // El cliente no envía userId (el backend lo toma del token); el admin sí
  create: (data: ReservationPayload) =>
    apiFetch<Reservation>("/reservations/", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: ReservationUpdatePayload) =>
    apiFetch<Reservation>(`/reservations/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/reservations/${id}`, { method: "DELETE" }),
}
