import { Layout } from "@/components/Layout";
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
  useHapusMapel,
  useMapel,
  useTambahMapel,
  useUbahMapel,
} from "@/hooks/use-mapel";
import {
  useHapusPeserta,
  usePeserta,
  useTambahPeserta,
  useUbahPeserta,
} from "@/hooks/use-peserta";
import { useAmbang, useSetAmbang } from "@/hooks/use-rekap";
import { usePeran } from "@/hooks/use-role";
import { KELOMPOK_TETAP, namaKelompok } from "@/lib/kelompok";
import type { MapelId, MataPelajaran, Peserta, PesertaId } from "@/types";
import { BookPlus, Pencil, Plus, Trash2, UserPlus, X } from "lucide-react";
import { useMemo, useState } from "react";

export function DataMasterPage() {
  const { isAdmin, isLoading } = usePeran();

  if (isLoading) {
    return (
      <Layout judul="Data Master" subjudul="Peserta & mata pelajaran">
        <ListSkeleton jumlah={4} />
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout judul="Data Master" subjudul="Peserta & mata pelajaran">
        <EmptyState
          judul="Akses terbatas"
          deskripsi="Hanya admin yang dapat mengelola data master. Hubungi admin bila Anda memerlukan perubahan."
        />
      </Layout>
    );
  }

  return (
    <Layout judul="Data Master" subjudul="Kelola peserta & mata pelajaran">
      <Tabs defaultValue="peserta">
        <TabsList className="grid w-full grid-cols-3" data-ocid="master.tabs">
          <TabsTrigger value="peserta" data-ocid="master.tab.peserta">
            Peserta
          </TabsTrigger>
          <TabsTrigger value="mapel" data-ocid="master.tab.mapel">
            Mapel
          </TabsTrigger>
          <TabsTrigger value="pengaturan" data-ocid="master.tab.pengaturan">
            Ambang
          </TabsTrigger>
        </TabsList>

        <TabsContent value="peserta" className="mt-4">
          <PesertaPanel />
        </TabsContent>
        <TabsContent value="mapel" className="mt-4">
          <MapelPanel />
        </TabsContent>
        <TabsContent value="pengaturan" className="mt-4">
          <AmbangPanel />
        </TabsContent>
      </Tabs>
    </Layout>
  );
}

const SEMUA_KELOMPOK = "semua";

function PesertaPanel() {
  const [cari, setCari] = useState("");
  const [filterKelompok, setFilterKelompok] = useState<string>(SEMUA_KELOMPOK);

  const filter = useMemo(
    () => ({
      nama: cari.trim() === "" ? undefined : cari.trim(),
      kelompokId:
        filterKelompok === SEMUA_KELOMPOK ? undefined : filterKelompok,
    }),
    [cari, filterKelompok],
  );

  const { data, isLoading, isError, refetch } = usePeserta(filter);
  const tambah = useTambahPeserta();
  const ubah = useUbahPeserta();
  const hapus = useHapusPeserta();

  const [terbuka, setTerbuka] = useState(false);
  const [idEdit, setIdEdit] = useState<PesertaId | null>(null);
  const [nama, setNama] = useState("");
  const [kelompokId, setKelompokId] = useState(KELOMPOK_TETAP[0].id);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const adaFilter = cari.trim() !== "" || filterKelompok !== SEMUA_KELOMPOK;

  function bukaTambah() {
    setIdEdit(null);
    setNama("");
    setKelompokId(KELOMPOK_TETAP[0].id);
    setPesanError(null);
    setTerbuka(true);
  }

  function bukaUbah(p: Peserta) {
    setIdEdit(p.id);
    setNama(p.nama);
    setKelompokId(p.kelompokId);
    setPesanError(null);
    setTerbuka(true);
  }

  function kirim() {
    if (!nama.trim()) {
      setPesanError("Nama peserta wajib diisi.");
      return;
    }
    const input = { nama: nama.trim(), kelompokId };
    if (idEdit !== null) {
      ubah.mutate(
        { id: idEdit, input },
        {
          onSuccess: () => setTerbuka(false),
          onError: (e) => setPesanError(pesanDariError(e)),
        },
      );
    } else {
      tambah.mutate(input, {
        onSuccess: () => setTerbuka(false),
        onError: (e) => setPesanError(pesanDariError(e)),
      });
    }
  }

  function konfirmasiHapus(p: Peserta) {
    if (!window.confirm(`Hapus peserta ${p.nama}?`)) return;
    hapus.mutate(p.id);
  }

  const sedangSimpan = tambah.isPending || ubah.isPending;

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        className="w-full rounded-lg"
        onClick={bukaTambah}
        data-ocid="master.peserta_tambah_button"
      >
        <UserPlus className="size-4" aria-hidden="true" />
        Tambah Peserta
      </Button>

      <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-subtle">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="peserta-cari">Cari peserta</Label>
          <Input
            id="peserta-cari"
            type="search"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari berdasarkan nama"
            data-ocid="master.peserta_search_input"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="peserta-filter-kelompok">Filter kelompok</Label>
          <Select value={filterKelompok} onValueChange={setFilterKelompok}>
            <SelectTrigger
              id="peserta-filter-kelompok"
              data-ocid="master.peserta_filter_select"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SEMUA_KELOMPOK}>Semua kelompok</SelectItem>
              {KELOMPOK_TETAP.map((k) => (
                <SelectItem key={k.id} value={k.id}>
                  {k.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {adaFilter ? (
          <Button
            type="button"
            variant="ghost"
            className="self-start rounded-lg"
            onClick={() => {
              setCari("");
              setFilterKelompok(SEMUA_KELOMPOK);
            }}
            data-ocid="master.peserta_reset_filter_button"
          >
            <X className="size-4" aria-hidden="true" />
            Reset filter
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <ListSkeleton jumlah={4} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (data ?? []).length === 0 ? (
        adaFilter ? (
          <EmptyState
            judul="Peserta tidak ditemukan"
            deskripsi="Tidak ada peserta yang cocok dengan pencarian atau filter kelompok. Coba ubah kata kunci."
          />
        ) : (
          <EmptyState
            judul="Belum ada peserta"
            deskripsi="Tambahkan peserta beserta kelompoknya untuk mulai mencatat absensi."
          />
        )
      ) : (
        <ul className="flex flex-col gap-3" data-ocid="master.peserta_list">
          {(data ?? []).map((p, index) => (
            <li
              key={p.id.toString()}
              data-ocid={`master.peserta_item.${index + 1}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-elevated"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">{p.nama}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {namaKelompok(p.kelompokId)}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Ubah ${p.nama}`}
                  onClick={() => bukaUbah(p)}
                  data-ocid={`master.peserta_edit_button.${index + 1}`}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus ${p.nama}`}
                  onClick={() => konfirmasiHapus(p)}
                  data-ocid={`master.peserta_delete_button.${index + 1}`}
                >
                  <Trash2
                    className="size-4 text-destructive"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={terbuka} onOpenChange={setTerbuka}>
        <DialogContent
          className="sm:max-w-md"
          data-ocid="master.peserta_dialog"
        >
          <DialogHeader>
            <DialogTitle>
              {idEdit !== null ? "Ubah Peserta" : "Tambah Peserta"}
            </DialogTitle>
            <DialogDescription>
              Peserta hanya menyimpan nama dan kelompok.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="peserta-nama">Nama</Label>
              <Input
                id="peserta-nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Nama lengkap"
                data-ocid="master.peserta_nama_input"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="peserta-kelompok">Kelompok</Label>
              <Select value={kelompokId} onValueChange={setKelompokId}>
                <SelectTrigger
                  id="peserta-kelompok"
                  data-ocid="master.peserta_kelompok_select"
                >
                  <SelectValue />
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
            {pesanError ? (
              <p
                data-ocid="master.peserta_form_error"
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
              onClick={() => setTerbuka(false)}
              data-ocid="master.peserta_cancel_button"
            >
              Batal
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={kirim}
              disabled={sedangSimpan}
              data-ocid="master.peserta_submit_button"
            >
              {sedangSimpan ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MapelPanel() {
  const { data, isLoading, isError, refetch } = useMapel();
  const tambah = useTambahMapel();
  const ubah = useUbahMapel();
  const hapus = useHapusMapel();

  const [terbuka, setTerbuka] = useState(false);
  const [idEdit, setIdEdit] = useState<MapelId | null>(null);
  const [nama, setNama] = useState("");
  const [pesanError, setPesanError] = useState<string | null>(null);

  function bukaTambah() {
    setIdEdit(null);
    setNama("");
    setPesanError(null);
    setTerbuka(true);
  }

  function bukaUbah(m: MataPelajaran) {
    setIdEdit(m.id);
    setNama(m.nama);
    setPesanError(null);
    setTerbuka(true);
  }

  function kirim() {
    if (!nama.trim()) {
      setPesanError("Nama mata pelajaran wajib diisi.");
      return;
    }
    const input = { nama: nama.trim() };
    if (idEdit !== null) {
      ubah.mutate(
        { id: idEdit, input },
        {
          onSuccess: () => setTerbuka(false),
          onError: (e) => setPesanError(pesanDariError(e)),
        },
      );
    } else {
      tambah.mutate(input, {
        onSuccess: () => setTerbuka(false),
        onError: (e) => setPesanError(pesanDariError(e)),
      });
    }
  }

  function konfirmasiHapus(m: MataPelajaran) {
    if (!window.confirm(`Hapus mata pelajaran ${m.nama}?`)) return;
    hapus.mutate(m.id);
  }

  const sedangSimpan = tambah.isPending || ubah.isPending;

  return (
    <div className="flex flex-col gap-4">
      <Button
        type="button"
        className="w-full rounded-lg"
        onClick={bukaTambah}
        data-ocid="master.mapel_tambah_button"
      >
        <BookPlus className="size-4" aria-hidden="true" />
        Tambah Mata Pelajaran
      </Button>

      {isLoading ? (
        <ListSkeleton jumlah={3} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (data ?? []).length === 0 ? (
        <EmptyState
          judul="Belum ada mata pelajaran"
          deskripsi="Tambahkan mata pelajaran untuk dipakai pada sesi pertemuan."
        />
      ) : (
        <ul className="flex flex-col gap-3" data-ocid="master.mapel_list">
          {(data ?? []).map((m, index) => (
            <li
              key={m.id.toString()}
              data-ocid={`master.mapel_item.${index + 1}`}
              className="flex items-center justify-between gap-3 rounded-2xl bg-card p-4 shadow-elevated"
            >
              <p className="min-w-0 truncate font-medium text-foreground">
                {m.nama}
              </p>
              <div className="flex shrink-0 gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Ubah ${m.nama}`}
                  onClick={() => bukaUbah(m)}
                  data-ocid={`master.mapel_edit_button.${index + 1}`}
                >
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Hapus ${m.nama}`}
                  onClick={() => konfirmasiHapus(m)}
                  data-ocid={`master.mapel_delete_button.${index + 1}`}
                >
                  <Trash2
                    className="size-4 text-destructive"
                    aria-hidden="true"
                  />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={terbuka} onOpenChange={setTerbuka}>
        <DialogContent className="sm:max-w-md" data-ocid="master.mapel_dialog">
          <DialogHeader>
            <DialogTitle>
              {idEdit !== null
                ? "Ubah Mata Pelajaran"
                : "Tambah Mata Pelajaran"}
            </DialogTitle>
            <DialogDescription>
              Mata pelajaran dipakai saat membuat sesi pertemuan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="mapel-nama">Nama</Label>
              <Input
                id="mapel-nama"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Tajwid"
                data-ocid="master.mapel_nama_input"
              />
            </div>
            {pesanError ? (
              <p
                data-ocid="master.mapel_form_error"
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
              onClick={() => setTerbuka(false)}
              data-ocid="master.mapel_cancel_button"
            >
              Batal
            </Button>
            <Button
              type="button"
              className="rounded-lg"
              onClick={kirim}
              disabled={sedangSimpan}
              data-ocid="master.mapel_submit_button"
            >
              {sedangSimpan ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AmbangPanel() {
  const { data: ambang, isLoading } = useAmbang();
  const setAmbang = useSetAmbang();
  const [nilai, setNilai] = useState("");
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const ambangTampil = useMemo(
    () => (ambang === undefined ? "75" : ambang.toFixed(1)),
    [ambang],
  );

  function simpan() {
    const angka = Number(nilai);
    if (Number.isNaN(angka) || angka < 0 || angka > 100) {
      setPesanError("Masukkan angka antara 0 dan 100.");
      return;
    }
    setPesanError(null);
    setPesanSukses(null);
    setAmbang.mutate(
      { persentase: angka },
      {
        onSuccess: (hasil) => {
          setPesanSukses(`Ambang kehadiran disimpan: ${hasil.toFixed(1)}%.`);
          setNilai("");
        },
        onError: (e) => setPesanError(pesanDariError(e)),
      },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-2xl bg-card p-5 shadow-elevated">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Ambang Kehadiran Saat Ini
        </p>
        <p className="mt-2 font-display text-3xl font-bold tabular-nums text-primary">
          {isLoading ? "…" : `${ambangTampil}%`}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Peserta dengan kehadiran di bawah ambang ditandai pada halaman Rekap.
        </p>
      </section>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ambang-nilai">Ambang Baru (%)</Label>
        <Input
          id="ambang-nilai"
          type="number"
          min={0}
          max={100}
          step={0.5}
          value={nilai}
          onChange={(e) => setNilai(e.target.value)}
          placeholder="75"
          data-ocid="master.ambang_input"
        />
      </div>

      {pesanSukses ? (
        <p
          data-ocid="master.ambang_success_state"
          className="rounded-lg bg-success/10 px-3 py-2 text-sm text-success"
        >
          {pesanSukses}
        </p>
      ) : null}
      {pesanError ? (
        <p
          data-ocid="master.ambang_error_state"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {pesanError}
        </p>
      ) : null}

      <Button
        type="button"
        className="w-full rounded-lg"
        onClick={simpan}
        disabled={setAmbang.isPending || nilai.trim() === ""}
        data-ocid="master.ambang_submit_button"
      >
        <Plus className="size-4" aria-hidden="true" />
        {setAmbang.isPending ? "Menyimpan…" : "Simpan Ambang"}
      </Button>
    </div>
  );
}

function pesanDariError(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Gagal menyimpan data. Coba lagi.";
}
