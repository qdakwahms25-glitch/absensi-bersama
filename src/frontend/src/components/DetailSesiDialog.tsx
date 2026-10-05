import { StatusAbsensi } from "@/backend";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/PageState";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDetailSesi } from "@/hooks/use-sesi";
import {
  formatJam,
  formatTanggal,
  labelMedia,
  labelStatus,
} from "@/lib/format";
import { namaKelompok } from "@/lib/kelompok";
import { cn } from "@/lib/utils";
import type { StatusAbsensi as StatusAbsensiType } from "@/types";

const WARNA_STATUS: Record<StatusAbsensiType, string> = {
  [StatusAbsensi.hadir]: "bg-success/15 text-success",
  [StatusAbsensi.izin]: "bg-accent/20 text-accent-foreground",
  [StatusAbsensi.sakit]: "bg-warning/20 text-warning-foreground",
  [StatusAbsensi.alpa]: "bg-destructive/15 text-destructive",
};

interface DetailSesiDialogProps {
  id: bigint | null;
  namaMapel: Map<string, string>;
  onClose: () => void;
}

export function DetailSesiDialog({
  id,
  namaMapel,
  onClose,
}: DetailSesiDialogProps) {
  const { data: detail, isLoading, isError } = useDetailSesi(id);

  return (
    <Dialog
      open={id !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        data-ocid="sesi.detail_dialog"
      >
        <DialogHeader>
          <DialogTitle>Detail Sesi</DialogTitle>
          <DialogDescription>
            Informasi lengkap pertemuan dan status absensi peserta.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <ListSkeleton jumlah={3} />
        ) : isError || !detail ? (
          <ErrorState pesan="Detail sesi tidak dapat dimuat." />
        ) : (
          <div className="flex flex-col gap-4">
            <section className="rounded-2xl bg-secondary/60 p-4">
              <p className="font-display text-base font-semibold text-foreground">
                {namaKelompok(detail.sesi.kelompokId)}
              </p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {namaMapel.get(detail.sesi.mapelId.toString()) ??
                  "Mata pelajaran"}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <div className="flex gap-1">
                  <dt className="text-muted-foreground">Tanggal:</dt>
                  <dd className="font-medium text-foreground">
                    {formatTanggal(detail.sesi.tanggal)}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-muted-foreground">Waktu:</dt>
                  <dd className="font-medium text-foreground">
                    {formatJam(detail.sesi.jendelaMulai)}–
                    {formatJam(detail.sesi.jendelaSelesai)}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-muted-foreground">Media:</dt>
                  <dd className="font-medium text-foreground">
                    {labelMedia(detail.sesi.media)}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-muted-foreground">Pemateri:</dt>
                  <dd className="truncate font-medium text-foreground">
                    {detail.sesi.pemateri}
                  </dd>
                </div>
                {detail.sesi.tempat ? (
                  <div className="col-span-2 flex gap-1">
                    <dt className="text-muted-foreground">Tempat:</dt>
                    <dd className="truncate font-medium text-foreground">
                      {detail.sesi.tempat}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>

            <section>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Peserta ({detail.peserta.length})
              </p>
              {detail.peserta.length === 0 ? (
                <EmptyState
                  judul="Belum ada peserta"
                  deskripsi="Kelompok ini belum memiliki peserta terdaftar."
                />
              ) : (
                <ul
                  className="flex flex-col gap-2"
                  data-ocid="sesi.detail_list"
                >
                  {detail.peserta.map((p, index) => (
                    <li
                      key={p.pesertaId.toString()}
                      data-ocid={`sesi.detail_item.${index + 1}`}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {p.nama}
                        </p>
                        {p.catatan ? (
                          <p className="truncate text-xs text-muted-foreground">
                            {p.catatan}
                          </p>
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
                          WARNA_STATUS[p.status],
                        )}
                      >
                        {labelStatus(p.status)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={onClose}
            data-ocid="sesi.detail_close_button"
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
