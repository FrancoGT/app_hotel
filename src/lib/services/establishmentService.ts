import { apiFetch, toArray, withNumbers } from "@/lib/http"
import type { Establishment, EstablishmentPayload } from "@/lib/types/establishment"

const normalize = (e: Establishment): Establishment => withNumbers(e, ["latitude", "longitude"])

export const establishmentService = {
  list: async (): Promise<Establishment[]> =>
    toArray<Establishment>(await apiFetch("/establishments?skip=0&limit=100")).map(normalize),

  create: async (data: EstablishmentPayload) =>
    normalize(await apiFetch<Establishment>("/establishments", { method: "POST", body: JSON.stringify(data) })),

  update: async (id: number, data: EstablishmentPayload) =>
    normalize(await apiFetch<Establishment>(`/establishments/${id}`, { method: "PUT", body: JSON.stringify(data) })),

  delete: (id: number) => apiFetch<void>(`/establishments/${id}`, { method: "DELETE" }),
}
