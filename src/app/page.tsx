"use client"

import { useEffect, useState } from "react"
import { RoomList } from "@/components/client/rooms/RoomList"
import { RecommendationBanner } from "@/components/client/RecommendationBanner"
import { HeroSection, LocationContactSection, ServicesSection } from "@/components/client/home/HomeSections"
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
    <div className="mx-auto max-w-6xl space-y-12 md:space-y-16">
      <HeroSection />

      {recommendations.length > 0 && <RecommendationBanner recommendation={recommendations[0]} />}

      <section id="habitaciones" aria-labelledby="habitaciones-title" className="scroll-mt-24">
        <h2 id="habitaciones-title" className="font-serif text-2xl text-[var(--illary-ink)] md:text-3xl">
          Habitaciones
        </h2>
        <p className="mb-5 mt-1 text-[var(--illary-text)]">
          Tarifas por noche. La disponibilidad se confirma para las fechas de tu solicitud.
        </p>
        <RoomList />
      </section>

      <ServicesSection />
      <LocationContactSection />
    </div>
  )
}
