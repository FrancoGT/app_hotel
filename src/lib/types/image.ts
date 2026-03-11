export interface Image {
  id: number
  entity_type: string
  entity_id: number
  url: string
  alt_text: string
  position: number
  is_main: boolean
  created_at: string
  updated_at: string
}

export interface ImagePayload {
  entity_type: string
  entity_id: number
  url: string
  alt_text?: string
  position?: number
  is_main?: boolean
}