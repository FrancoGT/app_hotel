import { apiFetch, toArray } from "@/lib/http"
import type { Establishment, EstablishmentPayload } from "@/lib/types/establishment"

export const establishmentService = {
  list: async (): Promise<Establishment[]> =>
    toArray<Establishment>(await apiFetch("/establishments?skip=0&limit=100")),

  create: (data: EstablishmentPayload) =>
    apiFetch<Establishment>("/establishments", { method: "POST", body: JSON.stringify(data) }),

  update: (id: number, data: EstablishmentPayload) =>
    apiFetch<Establishment>(`/establishments/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: number) => apiFetch<void>(`/establishments/${id}`, { method: "DELETE" }),
}
