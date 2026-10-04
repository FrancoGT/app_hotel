"use client"

import { useEffect, useState } from "react"
import { AdminCrudLayout } from "@/components/admin/AdminCrudLayout"
import { RolesTable } from "@/components/admin/roles/RolesTable"
import { RoleForm } from "@/components/admin/roles/RoleForm"
import { RolePermissionsManager } from "@/components/admin/roles/RolePermissionsManager"
import { Modal } from "@/components/ui/modal"
import { useCrudResource } from "@/hooks/useCrudResource"
import { useCrudPage } from "@/hooks/useCrudPage"
import { useListFilter } from "@/hooks/useListFilter"
import { useToast } from "@/hooks/useToast"
import { roleService } from "@/lib/services/roleService"
import type { Role, RolePayload } from "@/lib/types/role"

const searchFields = (r: Role) => [r.name, r.prefix, r.description]

export default function RolesAdminPage() {
  const resource = useCrudResource<Role, RolePayload>(roleService, {
    loadErrorMessage: "No se pudieron cargar los roles.",
  })
  const list = useListFilter(resource.items, searchFields)
  const crud = useCrudPage<Role, RolePayload>({
    create: resource.create,
    update: resource.update,
    remove: resource.remove,
    // El DELETE del backend solo desactiva: recargamos para mostrar el nuevo estado
    afterChange: resource.load,
    messages: {
      created: "Rol creado exitosamente",
      updated: "Rol actualizado exitosamente",
      deleted: "Rol desactivado",
      confirmDelete: (r) => `¿Desactivar el rol "${r.name}"? Sus usuarios perderán los permisos asociados.`,
    },
  })

  // Modal de permisos y usuarios del rol
  const [permissionsRole, setPermissionsRole] = useState<Role | null>(null)
  const permissionsToast = useToast()

  const { load } = resource
  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <AdminCrudLayout
        title="Roles"
        description="Agrupa permisos en roles y asígnalos a los usuarios."
        createLabel="Nuevo Rol"
        onCreate={crud.modal.openCreate}
        secondaryLink={{ href: "/admin/permissions", label: "Ver Permisos" }}
        searchPlaceholder="Buscar rol..."
        search={list.search}
        onSearchChange={list.setSearch}
        resultCount={list.filtered.length}
        error={resource.error}
        loading={resource.loading}
        loadingText="Cargando roles…"
        isEmpty={list.paginated.length === 0}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        toast={crud.toast ?? permissionsToast.toast}
        deletion={{ ...crud.deletion, confirmLabel: "Desactivar" }}
        modal={{
          isOpen: crud.modal.isOpen,
          title: crud.modal.editing ? `Editar Rol: ${crud.modal.editing.name}` : "Nuevo Rol",
          saving: crud.modal.saving,
          onClose: crud.modal.close,
          content: (
            <RoleForm
              initialData={crud.modal.editing}
              onSubmit={crud.modal.submit}
              onCancel={crud.modal.close}
              isSaving={crud.modal.saving}
            />
          ),
        }}
      >
        <RolesTable
          items={list.paginated}
          onEdit={crud.modal.openEdit}
          onDelete={crud.deletion.request}
          onManagePermissions={setPermissionsRole}
        />
      </AdminCrudLayout>

      {permissionsRole && (
        <Modal title={`Permisos del rol: ${permissionsRole.name}`} onClose={() => setPermissionsRole(null)}>
          <RolePermissionsManager role={permissionsRole} onNotify={permissionsToast.showToast} />
        </Modal>
      )}
    </>
  )
}
