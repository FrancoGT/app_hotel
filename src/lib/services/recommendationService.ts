import { apiFetch, toArray } from "@/lib/http"
import type { Recommendation } from "@/lib/types/recommendation"

export const recommendationService = {
  // Las recomendaciones son opcionales: ante cualquier error se devuelve una lista vacía
  listMy: async (): Promise<Recommendation[]> => {
    try {
      return toArray<Recommendation>(await apiFetch("/recommendations/my"))
    } catch (error) {
      console.error("No se pudieron cargar las recomendaciones:", error)
      return []
    }
  },
}
