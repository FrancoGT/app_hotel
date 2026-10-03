"use client"

import { DataTable, type Column } from "@/components/admin/DataTable"
import { StatusBadge } from "@/components/ui/status-badge"
import { PAYMENT_STATUS, RESERVATION_STATUS } from "@/lib/constants/status"
import type { ReservationAdmin } from "@/lib/types/reservation"

const columns: Column<ReservationAdmin>[] = [
  { header: "Nº", cell: (r) => r.id, className: "font-mono text-xs" },
  {
    header: "Cliente",
    cell: (r) =>
      r.user ? (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--dark-color)]">
            {r.user.first_name} {r.user.last_name}
          </span>
          <span className="text-xs text-[var(--color-400)]">{r.user.login}</span>
        </div>
      ) : (
        <span className="font-medium text-[var(--dark-color)]">Usuario ID: {r.userId}</span>
      ),
  },
  { header: "Habitación", cell: (r) => `Nº ${r.roomId}`, className: "text-[var(--dark-color)] font-medium" },
  {
    header: "Fechas",
    cell: (r) => (
      <div className="flex flex-col text-xs whitespace-nowrap">
        <span>In: {r.checkInDate}</span>
        <span>Out: {r.checkOutDate}</span>
      </div>
    ),
  },
  { header: "Huéspedes", cell: (r) => `${r.adults} Ad. / ${r.children ?? 0} Ni.` },
  { header: "Total", cell: (r) => `S/ ${r.totalAmount}`, className: "text-[var(--dark-color)] font-medium" },
  { header: "Estado", cell: (r) => <StatusBadge map={RESERVATION_STATUS} status={r.status} /> },
  { header: "Pago", cell: (r) => <StatusBadge map={PAYMENT_STATUS} status={r.paymentStatus} /> },
]

interface ReservationsTableProps {
  items: ReservationAdmin[]
  onEdit: (item: ReservationAdmin) => void
  onDelete: (item: ReservationAdmin) => void
}

export function ReservationsTable(props: ReservationsTableProps) {
  return <DataTable {...props} columns={columns} entityLabel="reserva" />
}
