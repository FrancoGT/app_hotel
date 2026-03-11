import { useState, useCallback } from "react"
import { roomService } from "@/lib/fetcher"
import { imageService } from "@/lib/services/imageService"
import type { Room, RoomPayload } from "@/lib/types/room"

interface RoomsState {
  items: Room[]
  loading: boolean
  error: string | null
}

export function useRooms() {
  const [state, setState] = useState<RoomsState>({
    items: [],
    loading: false,
    error: null,
  })

  // GET: Cargar habitaciones + sus imágenes principales
  const loadRooms = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await roomService.list()

      const roomsWithImages = await Promise.all(
        data.map(async (room: Room) => {
          try {
            const images = await imageService.listByEntity("room", room.id)
            const mainImage = images.find(img => img.is_main)?.url ?? images[0]?.url
            return { ...room, mainImage }
          } catch {
            return room
          }
        })
      )

      setState({ items: roomsWithImages, loading: false, error: null })
    } catch (e: any) {
      console.error(e)
      setState(prev => ({
        ...prev,
        loading: false,
        error: "No se pudieron cargar las habitaciones.",
      }))
    }
  }, [])

  // POST: Crear habitación
  const createRoom = useCallback(async (data: RoomPayload): Promise<Room> => {
    try {
      const created = await roomService.create(data)
      setState(prev => ({ ...prev, items: [created, ...prev.items] }))
      return created
    } catch (error) {
      throw error
    }
  }, [])

  // PUT: Actualizar habitación
  const updateRoom = useCallback(async (id: number, data: RoomPayload): Promise<Room> => {
    try {
      const updated = await roomService.update(id, data)
      setState(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === updated.id ? { ...updated, mainImage: item.mainImage } : item
        ),
      }))
      return updated
    } catch (error) {
      throw error
    }
  }, [])

  // DELETE: Eliminar habitación
  const deleteRoom = useCallback(async (id: number) => {
    try {
      await roomService.delete(id)
      setState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id),
      }))
    } catch (error) {
      throw error
    }
  }, [])

  return {
    rooms: state.items,
    loading: state.loading,
    error: state.error,
    loadRooms,
    createRoom,
    updateRoom,
    deleteRoom,
  }
}