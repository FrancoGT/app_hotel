"use client"

import { useEffect } from "react"
import { AdminCrudLayout } from "@/components/admin/AdminCrudLayout"
import { RoomTypesTable } from "@/components/admin/roomtypes/RoomTypesTable"
import { RoomTypeForm } from "@/components/admin/roomtypes/RoomTypeForm"
import { useCrudResource } from "@/hooks/useCrudResource"
import { useCrudPage } from "@/hooks/useCrudPage"
import { useListFilter } from "@/hooks/useListFilter"
import { roomTypeService } from "@/lib/services/roomTypeService"
import type { RoomType, RoomTypePayload } from "@/lib/types/room_type"

const searchFields = (t: RoomType) => [t.name, t.description]

export default function RoomTypesAdminPage() {
  const resource = useCrudResource<RoomType, RoomTypePayload>(roomTypeService, {
    loadErrorMessage: "No se pudieron cargar los tipos de habitación.",
  })
  const list = useListFilter(resource.items, searchFields)
  const crud = useCrudPage<RoomType, RoomTypePayload>({
    create: resource.create,
    update: resource.update,
    remove: resource.remove,
    messages: {
      created: "Tipo creado exitosamente",
      updated: "Tipo actualizado exitosamente",
      deleted: "Tipo de habitación eliminado exitosamente",
      confirmDelete: (t) => `¿Seguro que deseas eliminar el tipo de habitación "${t.name}"?`,
    },
  })

  const { load } = resource
  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminCrudLayout
      title="Tipos de Habitación"
      description="Configura las categorías, precios base y amenidades del hotel."
      createLabel="Nuevo Tipo"
      onCreate={crud.modal.openCreate}
      secondaryLink={{ href: "/admin/rooms", label: "Ver Habitaciones" }}
      searchPlaceholder="Buscar tipo de habitación..."
      search={list.search}
      onSearchChange={list.setSearch}
      resultCount={list.filtered.length}
      error={resource.error}
      loading={resource.loading}
      loadingText="Cargando tipos de habitación…"
      isEmpty={list.paginated.length === 0}
      page={list.page}
      totalPages={list.totalPages}
      onPageChange={list.setPage}
      toast={crud.toast}
      deletion={crud.deletion}
      modal={{
        isOpen: crud.modal.isOpen,
        title: crud.modal.editing ? `Editar Tipo: ${crud.modal.editing.name}` : "Nuevo Tipo de Habitación",
        saving: crud.modal.saving,
        onClose: crud.modal.close,
        content: (
          <RoomTypeForm
            initialData={crud.modal.editing}
            onSubmit={crud.modal.submit}
            onCancel={crud.modal.close}
            isSaving={crud.modal.saving}
          />
        ),
      }}
    >
      <RoomTypesTable items={list.paginated} onEdit={crud.modal.openEdit} onDelete={crud.deletion.request} />
    </AdminCrudLayout>
  )
}
