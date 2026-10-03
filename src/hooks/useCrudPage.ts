import { useState } from "react"
import { useToast } from "./useToast"

interface Options<T, TCreate, TUpdate> {
  create: (data: TCreate) => Promise<unknown>
  update: (id: number, data: TUpdate) => Promise<unknown>
  remove: (id: number) => Promise<void>
  // Se ejecuta tras guardar o eliminar (p. ej. recargar si el backend enriquece los datos)
  afterChange?: () => Promise<void> | void
  messages: {
    created: string
    updated: string
    deleted: string
    confirmDelete: (item: T) => string
  }
}

// Estado y handlers comunes de las páginas CRUD del panel admin:
// modal de crear/editar, confirmación de borrado y notificaciones.
export function useCrudPage<T extends { id: number }, TCreate, TUpdate = TCreate>({
  create,
  update,
  remove,
  afterChange,
  messages,
}: Options<T, TCreate, TUpdate>) {
  const { toast, showToast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [saving, setSaving] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<T | null>(null)

  const openCreate = () => {
    setEditing(null)
    setIsModalOpen(true)
  }

  const openEdit = (item: T) => {
    setEditing(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setIsModalOpen(false)
    setEditing(null)
  }

  const submit = async (data: TCreate | TUpdate) => {
    setSaving(true)
    try {
      if (editing) {
        await update(editing.id, data as TUpdate)
        showToast(messages.updated)
      } else {
        await create(data as TCreate)
        showToast(messages.created)
      }
      setIsModalOpen(false)
      setEditing(null)
      await afterChange?.()
    } catch (e) {
      console.error("Error al guardar:", e)
      showToast(e instanceof Error ? e.message : "Error al guardar", "error")
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    const item = pendingDelete
    setPendingDelete(null)
    try {
      await remove(item.id)
      showToast(messages.deleted)
      await afterChange?.()
    } catch (e) {
      console.error("Error al eliminar:", e)
      showToast(e instanceof Error ? e.message : "No se pudo eliminar el registro", "error")
    }
  }

  return {
    toast,
    modal: { isOpen: isModalOpen, editing, saving, openCreate, openEdit, close: closeModal, submit },
    deletion: {
      message: pendingDelete ? messages.confirmDelete(pendingDelete) : null,
      request: setPendingDelete,
      confirm: confirmDelete,
      cancel: () => setPendingDelete(null),
    },
  }
}
