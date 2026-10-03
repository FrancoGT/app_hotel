"use client"

import { useEffect } from "react"
import { AdminCrudLayout } from "@/components/admin/AdminCrudLayout"
import { RoomsTable } from "@/components/admin/rooms/RoomsTable"
import { RoomForm } from "@/components/admin/rooms/RoomForm"
import { useCrudResource } from "@/hooks/useCrudResource"
import { useCrudPage } from "@/hooks/useCrudPage"
import { useListFilter } from "@/hooks/useListFilter"
import { roomService } from "@/lib/services/roomService"
import { getStatusConfig, ROOM_STATUS } from "@/lib/constants/status"
import type { Room, RoomPayload } from "@/lib/types/room"

// En el panel se listan las habitaciones con su imagen principal
const adminRoomService = { ...roomService, list: roomService.listWithMainImage }

// El endpoint de update no devuelve la imagen: se conserva la que ya estaba
const keepMainImage = (prev: Room, updated: Room) => ({ ...updated, mainImage: prev.mainImage })

const searchFields = (r: Room) => [
  r.roomNumber,
  r.floor,
  r.roomTypeId,
  r.status,
  getStatusConfig(ROOM_STATUS, r.status).label,
]

export default function RoomsAdminPage() {
  const resource = useCrudResource<Room, RoomPayload>(adminRoomService, {
    loadErrorMessage: "No se pudieron cargar las habitaciones.",
    mergeUpdated: keepMainImage,
  })
  const list = useListFilter(resource.items, searchFields)
  const crud = useCrudPage<Room, RoomPayload>({
    create: resource.create,
    update: resource.update,
    remove: resource.remove,
    messages: {
      created: "Habitación creada exitosamente",
      updated: "Habitación actualizada exitosamente",
      deleted: "Habitación eliminada exitosamente",
      confirmDelete: (r) => `¿Seguro que deseas eliminar la habitación "${r.roomNumber}"?`,
    },
  })

  const { load } = resource
  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminCrudLayout
      title="Gestionar Habitaciones"
      description="Administra las habitaciones del hotel y su disponibilidad."
      createLabel="Nueva habitación"
      onCreate={crud.modal.openCreate}
      secondaryLink={{ href: "/admin/roomtypes", label: "Ver Tipos" }}
      searchPlaceholder="Buscar habitación..."
      search={list.search}
      onSearchChange={list.setSearch}
      resultCount={list.filtered.length}
      error={resource.error}
      loading={resource.loading}
      loadingText="Cargando habitaciones…"
      isEmpty={list.paginated.length === 0}
      page={list.page}
      totalPages={list.totalPages}
      onPageChange={list.setPage}
      toast={crud.toast}
      deletion={crud.deletion}
      modal={{
        isOpen: crud.modal.isOpen,
        title: crud.modal.editing ? `Editar Habitación ${crud.modal.editing.roomNumber}` : "Nueva Habitación",
        saving: crud.modal.saving,
        onClose: crud.modal.close,
        content: (
          <RoomForm
            initialData={crud.modal.editing}
            onSubmit={crud.modal.submit}
            onCancel={crud.modal.close}
            isSaving={crud.modal.saving}
          />
        ),
      }}
    >
      <RoomsTable items={list.paginated} onEdit={crud.modal.openEdit} onDelete={crud.deletion.request} />
    </AdminCrudLayout>
  )
}
