import { StatusAbsensi } from "@/backend";
import { labelStatus } from "@/lib/format";
import { cn } from "@/lib/utils";

const GAYA: Record<StatusAbsensi, string> = {
  [StatusAbsensi.hadir]: "bg-success/15 text-success border-success/30",
  [StatusAbsensi.izin]: "bg-accent/20 text-accent-foreground border-accent/40",
  [StatusAbsensi.sakit]:
    "bg-warning/20 text-warning-foreground border-warning/40",
  [StatusAbsensi.alpa]:
    "bg-destructive/15 text-destructive border-destructive/30",
};

interface StatusBadgeProps {
  status: StatusAbsensi;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide",
        GAYA[status],
        className,
      )}
    >
      {labelStatus(status)}
    </span>
  );
}
