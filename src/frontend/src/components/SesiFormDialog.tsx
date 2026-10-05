import { MediaSesi } from "@/backend";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dateToTimestamp } from "@/lib/format";
import { KELOMPOK_TETAP } from "@/lib/kelompok";
import type { MataPelajaran, Sesi, SesiInput } from "@/types";
import { useEffect, useState } from "react";

export interface FormSesi {
  kelompokId: string;
  mapelId: string;
  pemateri: string;
  media: MediaSesi;
  tempat: string;
  tanggal: string;
  jendelaMulai: string;
  jendelaSelesai: string;
}

export const FORM_KOSONG: FormSesi = {
  kelompokId: KELOMPOK_TETAP[0].id,
  mapelId: "",
  pemateri: "",
  media: MediaSesi.tatapMuka,
  tempat: "",
  tanggal: "",
  jendelaMulai: "",
  jendelaSelesai: "",
};

interface SesiFormDialogProps {
  terbuka: boolean;
  sesiEdit: Sesi | null;
  mapelList: MataPelajaran[];
  sedangSimpan: boolean;
  errorSimpan: string | null;
  onTutup: () => void;
  onSimpan: (input: SesiInput) => void;
}

export function SesiFormDialog({
  terbuka,
  sesiEdit,
  mapelList,
  sedangSimpan,
  errorSimpan,
  onTutup,
  onSimpan,
}: SesiFormDialogProps) {
  const [form, setForm] = useState<FormSesi>(FORM_KOSONG);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // Isi ulang draft saat dialog dibuka untuk sesi yang berbeda.
  useEffect(() => {
    if (!terbuka) return;
    setPesanError(null);
    if (sesiEdit) {
      setForm({
        kelompokId: sesiEdit.kelompokId,
        mapelId: sesiEdit.mapelId.toString(),
        pemateri: sesiEdit.pemateri,
        media: sesiEdit.media,
        tempat: sesiEdit.tempat ?? "",
        tanggal: toInputValue(sesiEdit.tanggal),
        jendelaMulai: toInputValue(sesiEdit.jendelaMulai),
        jendelaSelesai: toInputValue(sesiEdit.jendelaSelesai),
      });
    } else {
      setForm(FORM_KOSONG);
    }
  }, [terbuka, sesiEdit]);

  function kirim() {
    if (!form.mapelId) {
      setPesanError("Pilih mata pelajaran terlebih dahulu.");
      return;
    }
    if (!form.pemateri.trim()) {
      setPesanError("Nama pemateri wajib diisi.");
      return;
    }
    if (!form.tanggal || !form.jendelaMulai || !form.jendelaSelesai) {
      setPesanError("Lengkapi tanggal dan jendela waktu sesi.");
      return;
    }
    onSimpan({
      kelompokId: form.kelompokId,
      mapelId: BigInt(form.mapelId),
      pemateri: form.pemateri.trim(),
      media: form.media,
      tempat: form.tempat.trim() ? form.tempat.trim() : undefined,
      tanggal: dateToTimestamp(form.tanggal),
      jendelaMulai: dateToTimestamp(form.jendelaMulai),
      jendelaSelesai: dateToTimestamp(form.jendelaSelesai),
    });
  }

  return (
    <Dialog
      open={terbuka}
      onOpenChange={(open) => {
        if (!open) onTutup();
      }}
    >
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        data-ocid="sesi.dialog"
      >
        <DialogHeader>
          <DialogTitle>{sesiEdit ? "Ubah Sesi" : "Tambah Sesi"}</DialogTitle>
          <DialogDescription>
            Lengkapi detail pertemuan halaqah. Jendela waktu membatasi check-in
            mandiri.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sesi-kelompok">Kelompok</Label>
            <Select
              value={form.kelompokId}
              onValueChange={(v) => setForm((f) => ({ ...f, kelompokId: v }))}
            >
              <SelectTrigger
                id="sesi-kelompok"
                data-ocid="sesi.kelompok_select"
              >
                <SelectValue placeholder="Pilih kelompok" />
              </SelectTrigger>
              <SelectContent>
                {KELOMPOK_TETAP.map((k) => (
                  <SelectItem key={k.id} value={k.id}>
                    {k.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sesi-mapel">Mata Pelajaran</Label>
            <Select
              value={form.mapelId}
              onValueChange={(v) => setForm((f) => ({ ...f, mapelId: v }))}
            >
              <SelectTrigger id="sesi-mapel" data-ocid="sesi.mapel_select">
                <SelectValue placeholder="Pilih mata pelajaran" />
              </SelectTrigger>
              <SelectContent>
                {mapelList.map((m) => (
                  <SelectItem key={m.id.toString()} value={m.id.toString()}>
                    {m.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {mapelList.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Belum ada mata pelajaran. Tambahkan di Data Master.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sesi-pemateri">Pemateri</Label>
            <Input
              id="sesi-pemateri"
              value={form.pemateri}
              onChange={(e) =>
                setForm((f) => ({ ...f, pemateri: e.target.value }))
              }
              placeholder="Nama pemateri"
              data-ocid="sesi.pemateri_input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sesi-media">Media</Label>
            <Select
              value={form.media}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, media: v as MediaSesi }))
              }
            >
              <SelectTrigger id="sesi-media" data-ocid="sesi.media_select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MediaSesi.tatapMuka}>Tatap Muka</SelectItem>
                <SelectItem value={MediaSesi.zoom}>Zoom</SelectItem>
                <SelectItem value={MediaSesi.whatsapp}>WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sesi-tempat">Tempat (opsional)</Label>
            <Input
              id="sesi-tempat"
              value={form.tempat}
              onChange={(e) =>
                setForm((f) => ({ ...f, tempat: e.target.value }))
              }
              placeholder="Ruang / tautan"
              data-ocid="sesi.tempat_input"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sesi-tanggal">Tanggal &amp; Waktu</Label>
            <Input
              id="sesi-tanggal"
              type="datetime-local"
              value={form.tanggal}
              onChange={(e) =>
                setForm((f) => ({ ...f, tanggal: e.target.value }))
              }
              data-ocid="sesi.tanggal_input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sesi-mulai">Jendela Mulai</Label>
              <Input
                id="sesi-mulai"
                type="datetime-local"
                value={form.jendelaMulai}
                onChange={(e) =>
                  setForm((f) => ({ ...f, jendelaMulai: e.target.value }))
                }
                data-ocid="sesi.jendela_mulai_input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sesi-selesai">Jendela Selesai</Label>
              <Input
                id="sesi-selesai"
                type="datetime-local"
                value={form.jendelaSelesai}
                onChange={(e) =>
                  setForm((f) => ({ ...f, jendelaSelesai: e.target.value }))
                }
                data-ocid="sesi.jendela_selesai_input"
              />
            </div>
          </div>

          {(pesanError ?? errorSimpan) ? (
            <p
              data-ocid="sesi.form_error"
              className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {pesanError ?? errorSimpan}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            className="rounded-lg"
            onClick={onTutup}
            data-ocid="sesi.cancel_button"
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-lg"
            onClick={kirim}
            disabled={sedangSimpan}
            data-ocid="sesi.submit_button"
          >
            {sedangSimpan ? "Menyimpan…" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function toInputValue(timestamp: bigint): string {
  const date = new Date(Number(timestamp / 1_000_000n));
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}
