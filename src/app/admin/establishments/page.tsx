"use client"

import { useEffect } from "react"
import { AdminCrudLayout } from "@/components/admin/AdminCrudLayout"
import { EstablishmentsTable } from "@/components/admin/establishments/EstablishmentsTable"
import { EstablishmentForm } from "@/components/admin/establishments/EstablishmentForm"
import { useCrudResource } from "@/hooks/useCrudResource"
import { useCrudPage } from "@/hooks/useCrudPage"
import { useListFilter } from "@/hooks/useListFilter"
import { establishmentService } from "@/lib/services/establishmentService"
import type { Establishment, EstablishmentPayload } from "@/lib/types/establishment"

const searchFields = (e: Establishment) => [e.name, e.address, e.city, e.phone]

export default function EstablishmentsAdminPage() {
  const resource = useCrudResource<Establishment, EstablishmentPayload>(establishmentService, {
    loadErrorMessage: "No se pudieron cargar los establecimientos.",
  })
  const list = useListFilter(resource.items, searchFields)
  const crud = useCrudPage<Establishment, EstablishmentPayload>({
    create: resource.create,
    update: resource.update,
    remove: resource.remove,
    messages: {
      created: "Establecimiento creado exitosamente",
      updated: "Establecimiento actualizado exitosamente",
      deleted: "Establecimiento eliminado exitosamente",
      confirmDelete: (e) => `¿Seguro que deseas eliminar el establecimiento "${e.name}"?`,
    },
  })

  const { load } = resource
  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminCrudLayout
      title="Gestionar Establecimientos"
      description="Administra los establecimientos disponibles en el sistema."
      createLabel="Nuevo establecimiento"
      onCreate={crud.modal.openCreate}
      searchPlaceholder="Buscar establecimiento..."
      search={list.search}
      onSearchChange={list.setSearch}
      resultCount={list.filtered.length}
      error={resource.error}
      loading={resource.loading}
      loadingText="Cargando establecimientos…"
      isEmpty={list.paginated.length === 0}
      page={list.page}
      totalPages={list.totalPages}
      onPageChange={list.setPage}
      toast={crud.toast}
      deletion={crud.deletion}
      modal={{
        isOpen: crud.modal.isOpen,
        title: crud.modal.editing ? "Editar establecimiento" : "Nuevo establecimiento",
        saving: crud.modal.saving,
        onClose: crud.modal.close,
        content: (
          <EstablishmentForm
            initialData={crud.modal.editing}
            onSubmit={crud.modal.submit}
            onCancel={crud.modal.close}
            isSaving={crud.modal.saving}
          />
        ),
      }}
    >
      <EstablishmentsTable items={list.paginated} onEdit={crud.modal.openEdit} onDelete={crud.deletion.request} />
    </AdminCrudLayout>
  )
}
