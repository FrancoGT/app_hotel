"use client"

import { useEffect, useState } from "react"
import { RoomList } from "@/components/client/rooms/RoomList"
import { RecommendationBanner } from "@/components/client/RecommendationBanner"
import { useAuth } from "@/context/AuthContext"
import { recommendationService } from "@/lib/services/recommendationService"
import type { Recommendation } from "@/lib/types/recommendation"

export default function HomePage() {
  const { isLoggedIn } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])

  // Las recomendaciones son personales: solo se piden con sesión iniciada
  useEffect(() => {
    if (!isLoggedIn) {
      setRecommendations([])
      return
    }
    recommendationService.listMy().then(setRecommendations)
  }, [isLoggedIn])

  return (
    <>
      {recommendations.length > 0 && (
        <div className="mx-auto mt-6 mb-6 max-w-6xl">
          <RecommendationBanner recommendation={recommendations[0]} />
        </div>
      )}
      <RoomList />
    </>
  )
}
