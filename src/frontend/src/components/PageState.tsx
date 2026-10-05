import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertCircle, Inbox } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  judul: string;
  deskripsi: string;
  aksi?: ReactNode;
  ocid?: string;
}

export function EmptyState({ judul, deskripsi, aksi, ocid }: EmptyStateProps) {
  return (
    <div
      data-ocid={ocid ?? "empty_state"}
      className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-10 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="size-6" aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-base font-semibold text-foreground">
          {judul}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{deskripsi}</p>
      </div>
      {aksi}
    </div>
  );
}

interface ErrorStateProps {
  pesan?: string;
  onRetry?: () => void;
}

export function ErrorState({ pesan, onRetry }: ErrorStateProps) {
  return (
    <div
      data-ocid="error_state"
      className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertCircle className="size-6" aria-hidden="true" />
      </span>
      <div>
        <p className="font-display text-base font-semibold text-foreground">
          Gagal memuat data
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {pesan ?? "Terjadi kesalahan saat menghubungi server. Coba lagi."}
        </p>
      </div>
      {onRetry ? (
        <Button
          type="button"
          variant="outline"
          onClick={onRetry}
          data-ocid="retry_button"
        >
          Coba lagi
        </Button>
      ) : null}
    </div>
  );
}

interface ListSkeletonProps {
  jumlah?: number;
  className?: string;
}

export function ListSkeleton({ jumlah = 3, className }: ListSkeletonProps) {
  const ids = Array.from({ length: jumlah }, (_, i) => `skeleton-${i}`);
  return (
    <div
      data-ocid="loading_state"
      className={cn("flex flex-col gap-3", className)}
    >
      {ids.map((id) => (
        <div
          key={id}
          className="rounded-2xl border border-border bg-card p-4 shadow-subtle"
        >
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-3 h-3 w-2/3" />
          <Skeleton className="mt-2 h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
