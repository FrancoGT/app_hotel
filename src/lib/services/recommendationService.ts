import { Recommendation } from "@/lib/types/recommendation"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export async function fetchMyRecommendations(
  token: string
): Promise<Recommendation[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/recommendations/my`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    if (!res.ok) {
      return []
    }

    return await res.json()
  } catch (error) {
    console.error("No se pudo conectar con recomendaciones:", error)
    return []
  }
}