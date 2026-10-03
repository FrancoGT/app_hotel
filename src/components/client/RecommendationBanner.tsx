"use client"

import type { Recommendation } from "@/lib/types/recommendation"

interface RecommendationBannerProps {
  recommendation: Recommendation
  // Si se pasa, se muestra el botón para ver la habitación recomendada
  onReserve?: (roomId: number) => void
}

export function RecommendationBanner({ recommendation, onReserve }: RecommendationBannerProps) {
  return (
    <section className="rounded-2xl border border-[#9F836A]/30 bg-[#9F836A]/10 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-[#9F836A] font-semibold mb-1">Recomendación personalizada</p>
      <h2 className="text-lg font-serif text-[#6F4E37] mb-2">{recommendation.message}</h2>
      {recommendation.reason && <p className="text-sm text-gray-600">{recommendation.reason}</p>}

      {onReserve && (
        <button
          type="button"
          onClick={() => onReserve(recommendation.roomId)}
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#9F836A] px-5 py-2 text-sm font-medium text-white hover:bg-[#8A7158] transition-colors"
        >
          Ver habitación recomendada
        </button>
      )}
    </section>
  )
}
