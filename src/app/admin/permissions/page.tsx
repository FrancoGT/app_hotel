"use client"

import { useEffect } from "react"
import { AdminCrudLayout } from "@/components/admin/AdminCrudLayout"
import { PermissionsTable } from "@/components/admin/permissions/PermissionsTable"
import { PermissionForm } from "@/components/admin/permissions/PermissionForm"
import { useCrudResource } from "@/hooks/useCrudResource"
import { useCrudPage } from "@/hooks/useCrudPage"
import { useListFilter } from "@/hooks/useListFilter"
import { permissionService } from "@/lib/services/permissionService"
import type { Permission, PermissionPayload } from "@/lib/types/permission"

const searchFields = (p: Permission) => [p.name, p.description, p.perms, p.subperms, p.moduleOrigin, p.moduleId]

export default function PermissionsAdminPage() {
  const resource = useCrudResource<Permission, PermissionPayload>(permissionService, {
    loadErrorMessage: "No se pudieron cargar los permisos.",
  })
  const list = useListFilter(resource.items, searchFields)
  const crud = useCrudPage<Permission, PermissionPayload>({
    create: resource.create,
    update: resource.update,
    remove: resource.remove,
    // El DELETE del backend solo desactiva: recargamos para mostrar el nuevo estado
    afterChange: resource.load,
    messages: {
      created: "Permiso creado exitosamente",
      updated: "Permiso actualizado exitosamente",
      deleted: "Permiso desactivado",
      confirmDelete: (p) => `¿Desactivar el permiso "${p.name}"?`,
    },
  })

  const { load } = resource
  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminCrudLayout
      title="Permisos"
      description="Define los permisos por módulo que luego se asignan a los roles."
      createLabel="Nuevo Permiso"
      onCreate={crud.modal.openCreate}
      secondaryLink={{ href: "/admin/roles", label: "Ver Roles" }}
      searchPlaceholder="Buscar por nombre, módulo o permiso..."
      search={list.search}
      onSearchChange={list.setSearch}
      resultCount={list.filtered.length}
      error={resource.error}
      loading={resource.loading}
      loadingText="Cargando permisos…"
      isEmpty={list.paginated.length === 0}
      page={list.page}
      totalPages={list.totalPages}
      onPageChange={list.setPage}
      toast={crud.toast}
      deletion={{ ...crud.deletion, confirmLabel: "Desactivar" }}
      modal={{
        isOpen: crud.modal.isOpen,
        title: crud.modal.editing ? `Editar Permiso: ${crud.modal.editing.name}` : "Nuevo Permiso",
        saving: crud.modal.saving,
        onClose: crud.modal.close,
        content: (
          <PermissionForm
            initialData={crud.modal.editing}
            onSubmit={crud.modal.submit}
            onCancel={crud.modal.close}
            isSaving={crud.modal.saving}
          />
        ),
      }}
    >
      <PermissionsTable items={list.paginated} onEdit={crud.modal.openEdit} onDelete={crud.deletion.request} />
    </AdminCrudLayout>
  )
}
