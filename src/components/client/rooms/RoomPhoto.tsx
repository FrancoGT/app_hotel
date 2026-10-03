import Image from "next/image"
import { BedDouble } from "lucide-react"
import { PUBLISH_ROOM_PHOTOS } from "@/config/hotel"

interface RoomPhotoProps {
  src?: string
  alt: string
  priority?: boolean
}

// Foto 4:3 de la habitación; mientras no haya fotos verificadas se muestra un marcador neutro
export function RoomPhoto({ src, alt, priority = false }: RoomPhotoProps) {
  if (PUBLISH_ROOM_PHOTOS && src) {
    return (
      <div className="relative aspect-[4/3] w-full bg-[var(--illary-sand)]">
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>
    )
  }

  return (
    <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 bg-[var(--illary-sand)] text-[var(--illary-primary)]">
      <BedDouble aria-hidden className="h-10 w-10 opacity-60" />
      <span className="text-sm">Fotografía no disponible</span>
    </div>
  )
}
