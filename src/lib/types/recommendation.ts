export type Recommendation = {
  roomId: number
  roomNumber: string
  recommendedDate: string
  recommendedTime: string
  pricePerNight: number
  message: string
  reason?: string
}