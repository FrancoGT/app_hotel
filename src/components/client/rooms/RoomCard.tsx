import Image from "next/image"
import { StatusBadge } from "@/components/ui/status-badge"
import { normalizeStatus, ROOM_STATUS } from "@/lib/constants/status"
import type { Room } from "@/lib/types/room"

interface RoomCardProps {
  room: Room
  // Solo los usuarios con sesión ven el botón de reservar
  canReserve: boolean
  onReserve: (room: Room) => void
}

export function RoomCard({ room, canReserve, onReserve }: RoomCardProps) {
  const isAvailable = normalizeStatus(room.status) === "available"

  return (
    <div className="card relative rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {room.mainImage ? (
        <div className="relative h-48 w-full">
          <Image
            src={room.mainImage}
            alt={`Habitación ${room.roomNumber}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className="h-48 w-full bg-gray-100 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Sin imagen disponible</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <h2 className="text-lg font-semibold text-gray-800">{room.roomNumber}</h2>
          <StatusBadge
            map={ROOM_STATUS}
            status={room.status}
            className="px-3 py-1 font-semibold uppercase tracking-wide"
          />
        </div>

        <p className="text-sm text-[var(--illary-text-light)] mb-3 leading-relaxed">{room.description}</p>

        <div className="flex justify-between text-sm text-gray-600 mb-3">
          <span>Piso {room.floor}</span>
          <span>Máx. {room.maxOccupancy} personas</span>
        </div>

        <p className="text-2xl font-bold text-[var(--illary-primary)] mb-4">
          S/ {room.pricePerNight}
          <span className="ml-1 text-sm font-normal text-gray-500">/ noche</span>
        </p>

        <ul className="list-disc list-inside text-sm text-[var(--illary-text-light)] space-y-1 mb-4">
          {room.features.map((feature, idx) => (
            <li key={idx}>{feature}</li>
          ))}
        </ul>

        {canReserve && (
          <button
            className={`w-full py-2.5 rounded-lg font-medium transition ${
              isAvailable
                ? "btn-illary hover:brightness-110 active:scale-[0.98]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={() => onReserve(room)}
            disabled={!isAvailable}
          >
            {isAvailable ? "Reservar ahora" : "No disponible"}
          </button>
        )}
      </div>
    </div>
  )
}
