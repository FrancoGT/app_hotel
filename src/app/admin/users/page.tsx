"use client"

import { useEffect, useState } from "react"
import { AdminCrudLayout } from "@/components/admin/AdminCrudLayout"
import { UsersTable, fullName } from "@/components/admin/users/UsersTable"
import { UserForm } from "@/components/admin/users/UserForm"
import { UserRolesManager } from "@/components/admin/users/UserRolesManager"
import { Modal } from "@/components/ui/modal"
import { useCrudResource } from "@/hooks/useCrudResource"
import { useCrudPage } from "@/hooks/useCrudPage"
import { useListFilter } from "@/hooks/useListFilter"
import { useToast } from "@/hooks/useToast"
import { isActiveRecord } from "@/lib/constants/status"
import { userService } from "@/lib/services/userService"
import type { User, UserAdminPayload, UserAdminUpdatePayload } from "@/lib/types/user"

const searchFields = (u: User) => [u.login, u.displayName, u.first_name, u.last_name, u.telephone, u.id_document_number]

export default function UsersAdminPage() {
  const resource = useCrudResource<User, UserAdminPayload, UserAdminUpdatePayload>(userService, {
    loadErrorMessage: "No se pudieron cargar los usuarios.",
  })
  const list = useListFilter(resource.items, searchFields)
  const { replace } = resource

  // Los usuarios no se eliminan: la "eliminación" del CRUD alterna su estado A/I
  const crud = useCrudPage<User, UserAdminPayload, UserAdminUpdatePayload>({
    create: resource.create,
    update: resource.update,
    remove: async (id) => {
      const user = resource.items.find((u) => u.id === id)
      if (!user) return
      replace(await userService.setStatus(id, isActiveRecord(user.status) ? "I" : "A"))
    },
    messages: {
      created: "Usuario creado exitosamente",
      updated: "Usuario actualizado exitosamente",
      deleted: "Estado del usuario actualizado",
      confirmDelete: (u) =>
        isActiveRecord(u.status)
          ? `¿Desactivar al usuario "${u.login}"? No podrá iniciar sesión.`
          : `¿Activar al usuario "${u.login}"?`,
    },
  })

  // Modal de roles y permisos (independiente del de crear/editar)
  const [rolesUser, setRolesUser] = useState<User | null>(null)
  const rolesToast = useToast()

  const { load } = resource
  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <AdminCrudLayout
        title="Usuarios"
        description="Crea cuentas, edita sus datos, activa o desactiva el acceso y asigna roles."
        createLabel="Nuevo Usuario"
        onCreate={crud.modal.openCreate}
        secondaryLink={{ href: "/admin/roles", label: "Ver Roles" }}
        searchPlaceholder="Buscar por login, nombre, teléfono o documento..."
        search={list.search}
        onSearchChange={list.setSearch}
        resultCount={list.filtered.length}
        error={resource.error}
        loading={resource.loading}
        loadingText="Cargando usuarios…"
        isEmpty={list.paginated.length === 0}
        page={list.page}
        totalPages={list.totalPages}
        onPageChange={list.setPage}
        toast={crud.toast ?? rolesToast.toast}
        deletion={{
          ...crud.deletion,
          confirmLabel: isActiveRecord(crud.deletion.item?.status) ? "Desactivar" : "Activar",
        }}
        modal={{
          isOpen: crud.modal.isOpen,
          title: crud.modal.editing ? `Editar Usuario: ${crud.modal.editing.login}` : "Nuevo Usuario",
          saving: crud.modal.saving,
          onClose: crud.modal.close,
          content: (
            <UserForm
              initialData={crud.modal.editing}
              onSubmit={crud.modal.submit}
              onCancel={crud.modal.close}
              isSaving={crud.modal.saving}
            />
          ),
        }}
      >
        <UsersTable
          items={list.paginated}
          onEdit={crud.modal.openEdit}
          onManageRoles={setRolesUser}
          onToggleStatus={crud.deletion.request}
        />
      </AdminCrudLayout>

      {rolesUser && (
        <Modal
          title={`Roles de ${rolesUser.displayName || fullName(rolesUser) || rolesUser.login}`}
          onClose={() => setRolesUser(null)}
        >
          <UserRolesManager user={rolesUser} onNotify={rolesToast.showToast} />
        </Modal>
      )}
    </>
  )
}
