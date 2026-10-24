"use client"

import { useCallback, useEffect, useState } from "react"
import { AdminCrudLayout } from "@/components/admin/AdminCrudLayout"
import { ReservationsTable } from "@/components/admin/reservations/ReservationsTable"
import { ReservationForm } from "@/components/admin/reservations/ReservationForm"
import { useCrudResource } from "@/hooks/useCrudResource"
import { useCrudPage } from "@/hooks/useCrudPage"
import { useListFilter } from "@/hooks/useListFilter"
import { reservationService } from "@/lib/services/reservationService"
import { roomService } from "@/lib/services/roomService"
import { roomTypeService } from "@/lib/services/roomTypeService"
import { getStatusConfig, PAYMENT_STATUS, RESERVATION_STATUS } from "@/lib/constants/status"
import type { ReservationAdmin, ReservationPayload, ReservationUpdatePayload } from "@/lib/types/reservation"
import { reservedRoomLabel, withTypeNames, type CatalogRoom } from "@/lib/utils/roomContent"

// El admin trabaja sobre /reservations/all (incluye los datos del cliente)
const adminReservationService = { ...reservationService, list: reservationService.listAll }

// El endpoint de update no devuelve `user`: se conserva el que ya estaba
const keepUser = (prev: ReservationAdmin, updated: ReservationAdmin) => ({ ...updated, user: prev.user })

export default function ReservationsAdminPage() {
  // La reserva solo trae roomId: el número y el tipo se toman de /rooms y /room-types
  const [rooms, setRooms] = useState<Map<number, CatalogRoom>>(new Map())

  useEffect(() => {
    Promise.all([roomService.list(), roomTypeService.list().catch(() => [])])
      .then(([roomList, roomTypes]) => setRooms(new Map(withTypeNames(roomList, roomTypes).map((r) => [r.id, r]))))
      .catch((e) => console.error("No se pudieron cargar las habitaciones:", e))
  }, [])

  const roomLabel = useCallback((roomId: number) => reservedRoomLabel(rooms.get(roomId), roomId), [rooms])

  const searchFields = useCallback(
    (r: ReservationAdmin) => [
      r.id,
      roomLabel(r.roomId),
      r.checkInDate,
      r.checkOutDate,
      getStatusConfig(RESERVATION_STATUS, r.status).label,
      getStatusConfig(PAYMENT_STATUS, r.paymentStatus).label,
      r.user && `${r.user.first_name} ${r.user.last_name}`,
      r.user?.login,
    ],
    [roomLabel]
  )

  const resource = useCrudResource<ReservationAdmin, ReservationPayload, ReservationUpdatePayload>(
    adminReservationService,
    { loadErrorMessage: "No se pudieron cargar las reservaciones.", mergeUpdated: keepUser }
  )
  const list = useListFilter(resource.items, searchFields)
  const crud = useCrudPage<ReservationAdmin, ReservationPayload, ReservationUpdatePayload>({
    create: resource.create,
    update: resource.update,
    remove: resource.remove,
    // Recarga para traer los datos del cliente de las reservas nuevas
    afterChange: resource.load,
    messages: {
      created: "Reserva creada exitosamente",
      updated: "Reserva actualizada exitosamente",
      deleted: "Reserva eliminada exitosamente",
      // DELETE borra la reserva de la base de datos; para cancelarla se edita su estado
      confirmDelete: (r) =>
        `¿Seguro que deseas eliminar definitivamente la reserva #${r.id}? Para cancelarla y conservar el historial, edítala y cambia su estado a "Cancelada".`,
    },
  })

  const { load } = resource
  useEffect(() => {
    void load()
  }, [load])

  return (
    <AdminCrudLayout
      title="Gestionar Reservaciones"
      description="Visualiza, edita o crea reservas para tus clientes."
      createLabel="Nueva reserva"
      onCreate={crud.modal.openCreate}
      searchPlaceholder="Buscar reserva ..."
      search={list.search}
      onSearchChange={list.setSearch}
      resultCount={list.filtered.length}
      error={resource.error}
      loading={resource.loading}
      loadingText="Sincronizando tabla..."
      isEmpty={list.paginated.length === 0}
      page={list.page}
      totalPages={list.totalPages}
      onPageChange={list.setPage}
      toast={crud.toast}
      deletion={crud.deletion}
      modal={{
        isOpen: crud.modal.isOpen,
        title: crud.modal.editing ? `Editar Reserva #${crud.modal.editing.id}` : "Nueva Reserva Manual",
        saving: crud.modal.saving,
        onClose: crud.modal.close,
        content: (
          <ReservationForm
            initialData={crud.modal.editing}
            onSubmit={crud.modal.submit}
            onCancel={crud.modal.close}
            isSaving={crud.modal.saving}
          />
        ),
      }}
    >
      <ReservationsTable items={list.paginated} roomLabel={roomLabel} onEdit={crud.modal.openEdit} onDelete={crud.deletion.request} />
    </AdminCrudLayout>
  )
}
