import { ROOM_STATUS_MAP } from "@/lib/constants/room"

export function getStatusConfig(status: string) {
  const normalizedStatus = status.toLowerCase()
  return ROOM_STATUS_MAP[normalizedStatus] || { 
    label: status, 
    className: "bg-gray-100 text-gray-700 border-gray-200" 
  }
}

export function calculateTotalAmount(pricePerNight: number, checkIn: string, checkOut: string): number {
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const diffTime = checkOutDate.getTime() - checkInDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return pricePerNight * Math.max(diffDays, 1)
}

export function getTotalDays(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 1
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  const diffTime = checkOutDate.getTime() - checkInDate.getTime()
  return Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1)
}