import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { dateToTimestamp } from "@/lib/format";
import { namaKelompok } from "@/lib/kelompok";
import type { Sesi } from "@/types";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

interface BarisTanggal {
  id: string;
  nilai: string;
}

interface SesiDuplikatDialogProps {
  sumber: Sesi | null;
  namaMapel: Map<string, string>;
  sedangProses: boolean;
  onTutup: () => void;
  onDuplikat: (tanggalTujuan: bigint[]) => void;
}

export function SesiDuplikatDialog({
  sumber,
  namaMapel,
  sedangProses,
  onTutup,
  onDuplikat,
}: SesiDuplikatDialogProps) {
  const [baris, setBaris] = useState<BarisTanggal[]>([
    { id: "tujuan-0", nilai: "" },
  ]);
  const [pesanError, setPesanError] = useState<string | null>(null);

  useEffect(() => {
    if (sumber) {
      setBaris([{ id: `tujuan-${Date.now()}`, nilai: "" }]);
      setPesanError(null);
    }
  }, [sumber]);

  function kirim() {
    const valid = baris.filter((b) => b.nilai.trim() !== "");
    if (valid.length === 0) {
      setPesanError("Tambahkan minimal satu tanggal tujuan.");
      return;
    }
    onDuplikat(valid.map((b) => dateToTimestamp(b.nilai)));
  }

  return (
    <Dialog
      open={sumber !== null}
      onOpenChange={(open) => {
        if (!open) onTutup();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        data-ocid="sesi.duplikat_dialog"
      >
        <DialogHeader>
          <DialogTitle>Duplikat Sesi</DialogTitle>
          <DialogDescription>
            {sumber
              ? `Salin ${namaKelompok(sumber.kelompokId)} · ${
                  namaMapel.get(sumber.mapelId.toString()) ?? "Mata pelajaran"
                } ke beberapa tanggal sekaligus.`
              : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {baris.map((b, index) => (
            <div
              key={b.id}
              className="flex items-end gap-2"
              data-ocid={`sesi.duplikat_tanggal.${index + 1}`}
            >
              <div className="flex flex-1 flex-col gap-1.5">
                <Label htmlFor={b.id} className="text-xs">
                  Tanggal tujuan {index + 1}
                </Label>
                <Input
                  id={b.id}
                  type="datetime-local"
                  value={b.nilai}
                  onChange={(e) =>
                    setBaris((daftar) =>
                      daftar.map((t) =>
                        t.id === b.id ? { ...t, nilai: e.target.value } : t,
                      ),
                    )
                  }
                  data-ocid={`sesi.duplikat_tanggal_input.${index + 1}`}
                />
              </div>
              {baris.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus tanggal tujuan ${index + 1}`}
                  onClick={() =>
                    setBaris((daftar) => daftar.filter((t) => t.id !== b.id))
                  }
                  data-ocid={`sesi.duplikat_hapus_tanggal.${index + 1}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="self-start rounded-lg"
            onClick={() =>
              setBaris((daftar) => [
                ...daftar,
                { id: `tujuan-${Date.now()}-${daftar.length}`, nilai: "" },
              ])
            }
            data-ocid="sesi.duplikat_tambah_tanggal_button"
          >
            <Plus className="size-4" aria-hidden="true" />
            Tambah Tanggal
          </Button>

          {pesanError ? (
            <p
              data-ocid="sesi.duplikat_error"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {pesanError}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={onTutup}
            data-ocid="sesi.duplikat_cancel_button"
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-lg"
            onClick={kirim}
            disabled={sedangProses}
            data-ocid="sesi.duplikat_submit_button"
          >
            {sedangProses ? "Menyalin…" : "Duplikat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
