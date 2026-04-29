"use client"

import { Recommendation } from "@/lib/types/recommendation"

type Props = {
  recommendations: Recommendation[]
  onReserve?: (roomId: number) => void
}

export function RecommendationBanner({
  recommendations,
  onReserve,
}: Props) {
  if (!recommendations || recommendations.length === 0) return null

  const item = recommendations[0]

  return (
    <section className="mb-6 rounded-2xl border border-[#9F836A]/30 bg-[#9F836A]/10 p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-[#9F836A] font-semibold mb-1">
        Recomendación personalizada
      </p>

      <h2 className="text-lg font-serif text-[#6F4E37] mb-2">
        {item.message}
      </h2>

      {item.reason && (
        <p className="text-sm text-gray-600 mb-4">
          {item.reason}
        </p>
      )}

      <button
        type="button"
        onClick={() => onReserve?.(item.roomId)}
        className="inline-flex items-center justify-center rounded-xl bg-[#9F836A] px-5 py-2 text-sm font-medium text-white hover:bg-[#8A7158] transition-colors"
      >
        Ver habitación recomendada
      </button>
    </section>
  )
}