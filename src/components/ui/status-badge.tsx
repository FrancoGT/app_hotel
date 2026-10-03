import { cn } from "@/lib/utils"
import { getStatusConfig, type StatusConfig } from "@/lib/constants/status"

interface StatusBadgeProps {
  status?: string | null
  map: Record<string, StatusConfig>
  className?: string
}

export function StatusBadge({ status, map, className }: StatusBadgeProps) {
  const config = getStatusConfig(map, status)
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  )
}
