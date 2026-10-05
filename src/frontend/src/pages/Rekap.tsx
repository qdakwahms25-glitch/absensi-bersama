import { Layout } from "@/components/Layout";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/PageState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAmbang,
  useEksporRekap,
  useRekapPerKelompok,
  useRekapPerPeserta,
  useSetAmbang,
} from "@/hooks/use-rekap";
import { usePeran } from "@/hooks/use-role";
import { DAFTAR_BULAN, formatPersen } from "@/lib/format";
import { KELOMPOK_TETAP, namaKelompok } from "@/lib/kelompok";
import { cn } from "@/lib/utils";
import type { RekapFilter } from "@/types";
import { Download, FileSpreadsheet, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const SEMUA = "semua";

export function RekapPage() {
  const { isAdmin, isAnggota, isLoading: memuatPeran } = usePeran();
  const [kelompokId, setKelompokId] = useState<string>(SEMUA);
  const [bulan, setBulan] = useState<string>(SEMUA);
  const [tahun, setTahun] = useState<string>(SEMUA);

  const filter: RekapFilter = useMemo(
    () => ({
      kelompokId: kelompokId === SEMUA ? undefined : kelompokId,
      bulan: bulan === SEMUA ? undefined : BigInt(bulan),
      tahun: tahun === SEMUA ? undefined : BigInt(tahun),
    }),
    [kelompokId, bulan, tahun],
  );

  const peserta = useRekapPerPeserta(filter);
  const kelompok = useRekapPerKelompok(filter);
  const ekspor = useEksporRekap();

  const tahunOpsi = useMemo(() => {
    const sekarang = new Date().getFullYear();
    return [sekarang, sekarang - 1, sekarang - 2];
  }, []);

  const daftarPeserta = peserta.data ?? [];
  const jumlahDiBawahAmbang = daftarPeserta.filter(
    (r) => r.diBawahAmbang,
  ).length;

  function unduh(format: "pdf" | "excel") {
    ekspor.mutate(
      { format, filter },
      {
        onSuccess: (bytes) => {
          const blob = new Blob([bytes as BlobPart], {
            type:
              format === "excel" ? "text/csv;charset=utf-8" : "application/pdf",
          });
          const url = URL.createObjectURL(blob);
          const tautan = document.createElement("a");
          tautan.href = url;
          tautan.download =
            format === "excel" ? "rekap-absensi.csv" : "rekap-absensi.pdf";
          tautan.click();
          URL.revokeObjectURL(url);
          toast.success(
            format === "excel"
              ? "Rekap Excel berhasil diunduh"
              : "Rekap PDF berhasil diunduh",
          );
        },
        onError: () => {
          toast.error("Gagal mengekspor rekap. Coba lagi.");
        },
      },
    );
  }

  if (memuatPeran) {
    return (
      <Layout judul="Rekap" subjudul="Ringkasan kehadiran">
        <ListSkeleton jumlah={4} />
      </Layout>
    );
  }

  return (
    <Layout
      judul="Rekap"
      subjudul={isAnggota ? "Kehadiran Anda" : "Ringkasan kehadiran"}
    >
      <div className="flex flex-col gap-4">
        {isAnggota ? (
          <section
            className="rounded-2xl border border-border bg-secondary px-4 py-3"
            data-ocid="rekap.anggota_notice"
          >
            <p className="text-sm text-muted-foreground">
              Anda melihat rekap kehadiran Anda sendiri.
            </p>
          </section>
        ) : !isAdmin ? (
          <section
            className="rounded-2xl border border-border bg-secondary px-4 py-3"
            data-ocid="rekap.ketua_notice"
          >
            <p className="text-sm text-muted-foreground">
              Anda melihat rekap kehadiran peserta kelompok Anda.
            </p>
          </section>
        ) : (
          <section
            className="rounded-2xl bg-card p-4 shadow-elevated"
            data-ocid="rekap.filter_section"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rekap-kelompok">Kelompok</Label>
                <Select value={kelompokId} onValueChange={setKelompokId}>
                  <SelectTrigger
                    id="rekap-kelompok"
                    data-ocid="rekap.kelompok_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEMUA}>Semua kelompok</SelectItem>
                    {KELOMPOK_TETAP.map((k) => (
                      <SelectItem key={k.id} value={k.id}>
                        {k.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rekap-bulan">Bulan</Label>
                <Select value={bulan} onValueChange={setBulan}>
                  <SelectTrigger
                    id="rekap-bulan"
                    data-ocid="rekap.bulan_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEMUA}>Semua bulan</SelectItem>
                    {DAFTAR_BULAN.map((b) => (
                      <SelectItem key={b.nilai} value={b.nilai.toString()}>
                        {b.nama}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex flex-col gap-1.5">
                <Label htmlFor="rekap-tahun">Tahun</Label>
                <Select value={tahun} onValueChange={setTahun}>
                  <SelectTrigger
                    id="rekap-tahun"
                    data-ocid="rekap.tahun_select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEMUA}>Semua tahun</SelectItem>
                    {tahunOpsi.map((t) => (
                      <SelectItem key={t} value={t.toString()}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>
        )}

        {isAdmin ? <AmbangEditor /> : null}

        {!peserta.isLoading && !peserta.isError && daftarPeserta.length > 0 ? (
          <section
            className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary px-4 py-3"
            data-ocid="rekap.ringkasan_section"
          >
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {isAnggota ? "Kehadiran Anda" : "Peserta terpantau"}
              </p>
              <p className="font-display text-xl font-bold tabular-nums text-foreground">
                {daftarPeserta.length}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Di bawah ambang
              </p>
              <p
                className={cn(
                  "font-display text-xl font-bold tabular-nums",
                  jumlahDiBawahAmbang > 0 ? "text-destructive" : "text-primary",
                )}
              >
                {jumlahDiBawahAmbang}
              </p>
            </div>
          </section>
        ) : null}

        <Tabs defaultValue="peserta">
          <TabsList
            className={cn(
              "grid w-full",
              isAdmin ? "grid-cols-2" : "grid-cols-1",
            )}
            data-ocid="rekap.tabs"
          >
            <TabsTrigger value="peserta" data-ocid="rekap.tab.peserta">
              {isAnggota ? "Kehadiran Saya" : "Per Peserta"}
            </TabsTrigger>
            {isAdmin ? (
              <TabsTrigger value="kelompok" data-ocid="rekap.tab.kelompok">
                Per Kelompok
              </TabsTrigger>
            ) : null}
          </TabsList>

          <TabsContent value="peserta" className="mt-4">
            {peserta.isLoading ? (
              <ListSkeleton jumlah={4} />
            ) : peserta.isError ? (
              <ErrorState onRetry={() => void peserta.refetch()} />
            ) : daftarPeserta.length === 0 ? (
              <EmptyState
                judul="Belum ada rekap"
                deskripsi="Rekap akan muncul setelah absensi sesi diisi."
              />
            ) : (
              <ul
                className="flex flex-col gap-3"
                data-ocid="rekap.peserta_list"
              >
                {daftarPeserta.map((r, index) => (
                  <li
                    key={r.pesertaId.toString()}
                    data-ocid={`rekap.peserta_item.${index + 1}`}
                    className="rounded-2xl bg-card p-4 shadow-elevated"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">
                          {r.nama}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {namaKelompok(r.kelompokId)} · {r.hadir.toString()}/
                          {r.totalSesi.toString()} sesi
                        </p>
                      </div>
                      <p
                        className={cn(
                          "shrink-0 font-display text-lg font-bold tabular-nums",
                          r.diBawahAmbang ? "text-destructive" : "text-primary",
                        )}
                      >
                        {formatPersen(r.persentase)}
                      </p>
                    </div>
                    {r.diBawahAmbang ? (
                      <p className="mt-2 inline-flex rounded-full bg-destructive/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-destructive">
                        Di bawah ambang
                      </p>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          {isAdmin ? (
            <TabsContent value="kelompok" className="mt-4">
              {kelompok.isLoading ? (
                <ListSkeleton jumlah={4} />
              ) : kelompok.isError ? (
                <ErrorState onRetry={() => void kelompok.refetch()} />
              ) : (kelompok.data ?? []).length === 0 ? (
                <EmptyState
                  judul="Belum ada rekap"
                  deskripsi="Rekap kelompok akan muncul setelah absensi sesi diisi."
                />
              ) : (
                <ul
                  className="flex flex-col gap-3"
                  data-ocid="rekap.kelompok_list"
                >
                  {(kelompok.data ?? []).map((r, index) => (
                    <li
                      key={r.kelompokId}
                      data-ocid={`rekap.kelompok_item.${index + 1}`}
                      className="rounded-2xl bg-card p-4 shadow-elevated"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">
                            {r.nama}
                          </p>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {r.totalHadir.toString()}/{r.totalSesi.toString()}{" "}
                            kehadiran
                          </p>
                        </div>
                        <p className="shrink-0 font-display text-lg font-bold tabular-nums text-primary">
                          {formatPersen(r.persentase)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </TabsContent>
          ) : null}
        </Tabs>

        {isAdmin ? (
          <section
            className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-subtle"
            data-ocid="rekap.ekspor_section"
          >
            <p className="text-sm font-medium text-foreground">Ekspor rekap</p>
            <p className="text-xs text-muted-foreground">
              Unduh rekap sesuai filter yang dipilih.
            </p>
            <div className="mt-1 flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => unduh("excel")}
                disabled={ekspor.isPending}
                data-ocid="rekap.ekspor_excel_button"
              >
                <FileSpreadsheet className="size-4" aria-hidden="true" />
                Excel
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-lg"
                onClick={() => unduh("pdf")}
                disabled={ekspor.isPending}
                data-ocid="rekap.ekspor_pdf_button"
              >
                <Download className="size-4" aria-hidden="true" />
                PDF
              </Button>
            </div>
          </section>
        ) : null}
      </div>
    </Layout>
  );
}

function AmbangEditor() {
  const ambang = useAmbang();
  const setAmbang = useSetAmbang();
  const [terbuka, setTerbuka] = useState(false);
  const [nilai, setNilai] = useState("");

  const ambangAktif = ambang.data ?? 75;

  function buka() {
    setNilai(ambangAktif.toString());
    setTerbuka(true);
  }

  function simpan() {
    const angka = Number(nilai);
    if (!Number.isFinite(angka) || angka < 0 || angka > 100) {
      toast.error("Ambang harus berupa angka antara 0 dan 100.");
      return;
    }
    setAmbang.mutate(
      { persentase: angka },
      {
        onSuccess: () => {
          toast.success(`Ambang kehadiran diubah menjadi ${angka}%`);
          setTerbuka(false);
        },
        onError: () => {
          toast.error("Gagal menyimpan ambang. Coba lagi.");
        },
      },
    );
  }

  return (
    <section
      className="rounded-2xl border border-border bg-card p-4 shadow-subtle"
      data-ocid="rekap.ambang_section"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Ambang kehadiran
            </p>
            <p className="text-xs text-muted-foreground">
              Peserta di bawah{" "}
              <span className="font-semibold text-foreground">
                {formatPersen(ambangAktif)}
              </span>{" "}
              ditandai
            </p>
          </div>
        </div>
        {!terbuka ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0 rounded-lg"
            onClick={buka}
            data-ocid="rekap.ambang_edit_button"
          >
            Ubah
          </Button>
        ) : null}
      </div>

      {terbuka ? (
        <div className="mt-3 flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="rekap-ambang">Ambang (%)</Label>
            <Input
              id="rekap-ambang"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step={1}
              value={nilai}
              onChange={(e) => setNilai(e.target.value)}
              data-ocid="rekap.ambang_input"
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            className="rounded-lg"
            onClick={() => setTerbuka(false)}
            disabled={setAmbang.isPending}
            data-ocid="rekap.ambang_cancel_button"
          >
            Batal
          </Button>
          <Button
            type="button"
            className="rounded-lg"
            onClick={simpan}
            disabled={setAmbang.isPending}
            data-ocid="rekap.ambang_save_button"
          >
            {setAmbang.isPending ? "Menyimpan…" : "Simpan"}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
