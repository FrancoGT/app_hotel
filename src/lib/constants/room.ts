export type RoomStatusConfig = {
  label: string
  className: string
}

export const ROOM_STATUS_MAP: Record<string, RoomStatusConfig> = {
  available: { 
    label: "Disponible", 
    className: "bg-emerald-100 text-emerald-700 border-emerald-200" 
  },
  maintenance: { 
    label: "Mantenimiento", 
    className: "bg-amber-100 text-amber-700 border-amber-200" 
  },
  occupied: { 
    label: "Ocupada", 
    className: "bg-rose-100 text-rose-700 border-rose-200" 
  },
  cleaning: { 
    label: "Limpieza", 
    className: "bg-sky-100 text-sky-700 border-sky-200" 
  },
}