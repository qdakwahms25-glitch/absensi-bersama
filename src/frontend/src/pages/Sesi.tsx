import { DetailSesiDialog } from "@/components/DetailSesiDialog";
import { Layout } from "@/components/Layout";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/PageState";
import { SesiDuplikatDialog } from "@/components/SesiDuplikatDialog";
import { SesiFormDialog } from "@/components/SesiFormDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMapel } from "@/hooks/use-mapel";
import { usePeran } from "@/hooks/use-role";
import {
  useBuatSesi,
  useDuplikatSesi,
  useHapusSesi,
  useSesi,
  useUbahSesi,
} from "@/hooks/use-sesi";
import {
  DAFTAR_BULAN,
  formatChipTanggal,
  formatJam,
  formatTanggal,
  labelMedia,
} from "@/lib/format";
import { KELOMPOK_TETAP, namaKelompok } from "@/lib/kelompok";
import type { Sesi, SesiFilter, SesiInput } from "@/types";
import { Link } from "@tanstack/react-router";
import { CalendarPlus, Copy, Eye, Pencil, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

export function SesiPage() {
  const { isAdmin } = usePeran();
  const { data: mapelList } = useMapel();

  const [filterKelompok, setFilterKelompok] = useState<string>("");
  const [filterMapel, setFilterMapel] = useState<string>("");
  const [filterBulan, setFilterBulan] = useState<string>("");

  const filter: SesiFilter = useMemo(
    () => ({
      kelompokId: filterKelompok || undefined,
      mapelId: filterMapel ? BigInt(filterMapel) : undefined,
      bulan: filterBulan ? BigInt(filterBulan) : undefined,
    }),
    [filterKelompok, filterMapel, filterBulan],
  );

  const { data: sesiList, isLoading, isError, refetch } = useSesi(filter);
  const buatSesi = useBuatSesi();
  const ubahSesi = useUbahSesi();
  const hapusSesi = useHapusSesi();
  const duplikatSesi = useDuplikatSesi();

  const [dialogTerbuka, setDialogTerbuka] = useState(false);
  const [sesiEdit, setSesiEdit] = useState<Sesi | null>(null);
  const [errorSimpan, setErrorSimpan] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<bigint | null>(null);
  const [duplikatSumber, setDuplikatSumber] = useState<Sesi | null>(null);

  const namaMapel = useMemo(() => {
    const peta = new Map<string, string>();
    for (const m of mapelList ?? []) peta.set(m.id.toString(), m.nama);
    return peta;
  }, [mapelList]);

  const adaFilter = Boolean(filterKelompok || filterMapel || filterBulan);
  const sedangSimpan = buatSesi.isPending || ubahSesi.isPending;

  function bukaTambah() {
    setSesiEdit(null);
    setErrorSimpan(null);
    setDialogTerbuka(true);
  }

  function bukaUbah(sesi: Sesi) {
    setSesiEdit(sesi);
    setErrorSimpan(null);
    setDialogTerbuka(true);
  }

  function simpan(input: SesiInput) {
    setErrorSimpan(null);
    const onError = (e: unknown) =>
      setErrorSimpan(
        e instanceof Error ? e.message : "Gagal menyimpan sesi. Coba lagi.",
      );
    if (sesiEdit) {
      ubahSesi.mutate(
        { id: sesiEdit.id, input },
        { onSuccess: () => setDialogTerbuka(false), onError },
      );
    } else {
      buatSesi.mutate(input, {
        onSuccess: () => setDialogTerbuka(false),
        onError,
      });
    }
  }

  function konfirmasiHapus(sesi: Sesi) {
    if (
      !window.confirm(
        `Hapus sesi ${namaKelompok(sesi.kelompokId)} pada ${formatTanggal(sesi.tanggal)}?`,
      )
    ) {
      return;
    }
    hapusSesi.mutate(sesi.id);
  }

  function resetFilter() {
    setFilterKelompok("");
    setFilterMapel("");
    setFilterBulan("");
  }

  return (
    <Layout
      judul="Sesi"
      subjudul="Jadwal pertemuan halaqah"
      aksi={
        isAdmin ? (
          <Button
            type="button"
            size="sm"
            className="rounded-lg"
            onClick={bukaTambah}
            data-ocid="sesi.tambah_button"
          >
            <CalendarPlus className="size-4" aria-hidden="true" />
            Tambah
          </Button>
        ) : null
      }
    >
      <section
        aria-label="Filter sesi"
        className="mb-4 flex flex-col gap-3 rounded-2xl bg-card p-3 shadow-subtle"
        data-ocid="sesi.filter_panel"
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Filter
          </p>
          {adaFilter ? (
            <button
              type="button"
              onClick={resetFilter}
              data-ocid="sesi.filter_reset_button"
              className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-primary transition-smooth hover:bg-primary/10"
            >
              <X className="size-3.5" aria-hidden="true" />
              Reset
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-kelompok" className="text-xs">
            Kelompok
          </Label>
          <Select
            value={filterKelompok || "semua"}
            onValueChange={(v) => setFilterKelompok(v === "semua" ? "" : v)}
          >
            <SelectTrigger
              id="filter-kelompok"
              data-ocid="sesi.filter_kelompok_select"
            >
              <SelectValue placeholder="Semua kelompok" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semua">Semua kelompok</SelectItem>
              {KELOMPOK_TETAP.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-mapel" className="text-xs">
              Mata Pelajaran
            </Label>
            <Select
              value={filterMapel || "semua"}
              onValueChange={(v) => setFilterMapel(v === "semua" ? "" : v)}
            >
              <SelectTrigger
                id="filter-mapel"
                data-ocid="sesi.filter_mapel_select"
              >
                <SelectValue placeholder="Semua mapel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua mapel</SelectItem>
                {(mapelList ?? []).map((m) => (
                  <SelectItem key={m.id.toString()} value={m.id.toString()}>
                    {m.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-bulan" className="text-xs">
              Bulan
            </Label>
            <Select
              value={filterBulan || "semua"}
              onValueChange={(v) => setFilterBulan(v === "semua" ? "" : v)}
            >
              <SelectTrigger
                id="filter-bulan"
                data-ocid="sesi.filter_bulan_select"
              >
                <SelectValue placeholder="Semua bulan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="semua">Semua bulan</SelectItem>
                {DAFTAR_BULAN.map((b) => (
                  <SelectItem key={b.nilai} value={b.nilai.toString()}>
                    {b.nama}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {isLoading ? (
        <ListSkeleton jumlah={4} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (sesiList ?? []).length === 0 ? (
        <EmptyState
          judul={adaFilter ? "Tidak ada sesi cocok" : "Belum ada sesi"}
          deskripsi={
            adaFilter
              ? "Coba ubah atau reset filter untuk melihat sesi lainnya."
              : "Sesi pertemuan akan tampil di sini setelah ditambahkan."
          }
          aksi={
            isAdmin && !adaFilter ? (
              <Button
                type="button"
                className="rounded-lg"
                onClick={bukaTambah}
                data-ocid="sesi.empty_tambah_button"
              >
                Tambah Sesi Pertama
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="flex flex-col gap-3" data-ocid="sesi.list">
          {(sesiList ?? []).map((sesi, index) => (
            <li
              key={sesi.id.toString()}
              data-ocid={`sesi.item.${index + 1}`}
              className="animate-fade-up rounded-2xl bg-card p-4 shadow-elevated"
              style={{ animationDelay: `${index * 40}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base font-semibold text-foreground">
                    {namaKelompok(sesi.kelompokId)}
                  </p>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {namaMapel.get(sesi.mapelId.toString()) ?? "Mata pelajaran"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-accent/20 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground">
                  {formatChipTanggal(sesi.tanggal)}
                </span>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm">
                <div className="flex gap-1">
                  <dt className="text-muted-foreground">Waktu:</dt>
                  <dd className="font-medium text-foreground">
                    {formatJam(sesi.jendelaMulai)}–
                    {formatJam(sesi.jendelaSelesai)}
                  </dd>
                </div>
                <div className="flex gap-1">
                  <dt className="text-muted-foreground">Media:</dt>
                  <dd className="font-medium text-foreground">
                    {labelMedia(sesi.media)}
                  </dd>
                </div>
                <div className="col-span-2 flex gap-1">
                  <dt className="text-muted-foreground">Pemateri:</dt>
                  <dd className="truncate font-medium text-foreground">
                    {sesi.pemateri}
                  </dd>
                </div>
                {sesi.tempat ? (
                  <div className="col-span-2 flex gap-1">
                    <dt className="text-muted-foreground">Tempat:</dt>
                    <dd className="truncate font-medium text-foreground">
                      {sesi.tempat}
                    </dd>
                  </div>
                ) : null}
              </dl>

              <div className="mt-4 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg"
                  onClick={() => setDetailId(sesi.id)}
                  data-ocid={`sesi.detail_button.${index + 1}`}
                >
                  <Eye className="size-4" aria-hidden="true" />
                  Detail
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg"
                >
                  <Link
                    to="/absensi"
                    search={{ sesi: sesi.id.toString() }}
                    data-ocid={`sesi.isi_absensi_button.${index + 1}`}
                  >
                    Isi Absensi
                  </Link>
                </Button>
                {isAdmin ? (
                  <>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Duplikat sesi"
                      onClick={() => setDuplikatSumber(sesi)}
                      data-ocid={`sesi.duplikat_button.${index + 1}`}
                    >
                      <Copy className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Ubah sesi"
                      onClick={() => bukaUbah(sesi)}
                      data-ocid={`sesi.edit_button.${index + 1}`}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Hapus sesi"
                      onClick={() => konfirmasiHapus(sesi)}
                      data-ocid={`sesi.delete_button.${index + 1}`}
                    >
                      <Trash2
                        className="size-4 text-destructive"
                        aria-hidden="true"
                      />
                    </Button>
                  </>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}

      <SesiFormDialog
        terbuka={dialogTerbuka}
        sesiEdit={sesiEdit}
        mapelList={mapelList ?? []}
        sedangSimpan={sedangSimpan}
        errorSimpan={errorSimpan}
        onTutup={() => setDialogTerbuka(false)}
        onSimpan={simpan}
      />

      <SesiDuplikatDialog
        sumber={duplikatSumber}
        namaMapel={namaMapel}
        sedangProses={duplikatSesi.isPending}
        onTutup={() => setDuplikatSumber(null)}
        onDuplikat={(tanggalTujuan) => {
          if (!duplikatSumber) return;
          duplikatSesi.mutate(
            { sesiId: duplikatSumber.id, tanggalTujuan },
            { onSuccess: () => setDuplikatSumber(null) },
          );
        }}
      />

      <DetailSesiDialog
        id={detailId}
        namaMapel={namaMapel}
        onClose={() => setDetailId(null)}
      />
    </Layout>
  );
}
