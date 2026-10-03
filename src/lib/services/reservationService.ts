import { apiFetch, toArray, withNumbers } from "@/lib/http"
import type {
  Reservation,
  ReservationAdmin,
  ReservationPayload,
  ReservationUpdatePayload,
} from "@/lib/types/reservation"

const normalize = <T extends Reservation>(r: T): T => withNumbers(r, ["totalAmount"])

export const reservationService = {
  // Admin: todas las reservas, con los datos del cliente
  listAll: async (): Promise<ReservationAdmin[]> =>
    toArray<ReservationAdmin>(await apiFetch("/reservations/all")).map(normalize),

  // Cliente: solo las reservas del usuario autenticado
  listMy: async (): Promise<Reservation[]> =>
    toArray<Reservation>(await apiFetch("/reservations/my")).map(normalize),

  getById: async (id: number) => normalize(await apiFetch<Reservation>(`/reservations/${id}`)),

  // El cliente no envía userId (el backend lo toma del token); el admin sí
  create: async (data: ReservationPayload) =>
    normalize(await apiFetch<Reservation>("/reservations/", { method: "POST", body: JSON.stringify(data) })),

  update: async (id: number, data: ReservationUpdatePayload) =>
    normalize(await apiFetch<Reservation>(`/reservations/${id}`, { method: "PUT", body: JSON.stringify(data) })),

  delete: (id: number) => apiFetch<void>(`/reservations/${id}`, { method: "DELETE" }),
}
