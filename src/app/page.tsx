"use client"

import { useEffect, useState } from "react"
import RoomList from "@/components/common/RoomList"
import { fetchMyRecommendations } from "@/lib/services/recommendationService"
import { Recommendation } from "@/lib/types/recommendation"

export default function Page() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  useEffect(() => {
    const loadRecommendations = async () => {
      const token = localStorage.getItem("access_token")

      if (!token) {
        setRecommendations([])
        return
      }

      try {
        const data = await fetchMyRecommendations(token)
        setRecommendations(data)
      } catch (error) {
        console.error("Error cargando recomendaciones:", error)
        setRecommendations([])
      }
    }

    loadRecommendations()
  }, [])

  return (
    <main>
      {recommendations.length > 0 && (
        <section className="mx-auto mt-6 mb-6 max-w-6xl rounded-2xl border border-[#9F836A]/30 bg-[#9F836A]/10 p-5 shadow-sm">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[#9F836A]">
            Recomendación personalizada
          </p>

          <h2 className="mb-2 text-lg font-serif text-[#6F4E37]">
            {recommendations[0].message}
          </h2>

          {recommendations[0].reason && (
            <p className="text-sm text-gray-600">
              {recommendations[0].reason}
            </p>
          )}
        </section>
      )}

      <RoomList />
    </main>
  )
}