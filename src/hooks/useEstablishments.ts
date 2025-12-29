import { useState, useCallback } from "react"

import { establishmentService } from "@/lib/services/establishmentService"
import { Establishment, EstablishmentPayload, EstablishmentsState } from "@/lib/types/establishment"

export function useEstablishments() {
  const [state, setState] = useState<EstablishmentsState>({
    items: [],
    loading: false,
    error: null,
  })

  const loadEstablishments = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const data = await establishmentService.list()
      setState({ items: data, loading: false, error: null })
    } catch (e: any) {
      console.error(e)
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: "No se pudieron cargar los establecimientos." 
      }))
    }
  }, [])

  const createEstablishment = useCallback(async (data: EstablishmentPayload): Promise<Establishment> => {
    const created = await establishmentService.create(data)
    setState(prev => ({ ...prev, items: [created, ...prev.items] }))
    return created
  }, [])

  const updateEstablishment = useCallback(async (id: number, data: EstablishmentPayload): Promise<Establishment> => {
    const updated = await establishmentService.update(id, data)
    setState(prev => ({
      ...prev,
      items: prev.items.map(item => item.id === updated.id ? updated : item)
    }))
    return updated
  }, [])

  const deleteEstablishment = useCallback(async (id: number) => {
    await establishmentService.delete(id)
    setState(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }))
  }, [])

  return {
    establishments: state.items,
    loading: state.loading,
    error: state.error,
    loadEstablishments,
    createEstablishment,
    updateEstablishment,
    deleteEstablishment,
  }
}