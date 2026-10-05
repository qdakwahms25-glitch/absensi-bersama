import { Layout } from "@/components/Layout";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/PageState";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/hooks/use-rekap";
import { usePeran } from "@/hooks/use-role";
import {
  formatJam,
  formatPersen,
  formatTanggal,
  labelMedia,
} from "@/lib/format";
import { namaKelompok } from "@/lib/kelompok";
import { Link } from "@tanstack/react-router";
import { CalendarClock, TrendingDown, Users } from "lucide-react";

export function DashboardPage() {
  const { data, isLoading, isError, refetch } = useDashboard();
  const { peran } = usePeran();

  const labelPeran =
    peran === "admin"
      ? "Admin"
      : peran === "ketuaHalaqah"
        ? "Ketua Halaqah"
        : "Anggota";

  return (
    <Layout judul="Dashboard" subjudul={`Masuk sebagai ${labelPeran}`}>
      {isLoading ? (
        <ListSkeleton jumlah={3} />
      ) : isError ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : (
        <div className="flex flex-col gap-4">
          <section
            data-ocid="dashboard.kehadiran_card"
            className="animate-fade-up rounded-2xl bg-card p-5 shadow-elevated"
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingDown className="size-4" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-widest">
                Kehadiran Bulan Ini
              </p>
            </div>
            <p className="mt-3 font-display text-4xl font-bold tabular-nums text-primary">
              {formatPersen(data?.kehadiranBulanIni ?? 0)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Rata-rata kehadiran seluruh halaqah pada bulan berjalan.
            </p>
          </section>

          <section
            data-ocid="dashboard.sesi_terdekat_card"
            className="animate-fade-up rounded-2xl bg-card p-5 shadow-elevated"
            style={{ animationDelay: "40ms" }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarClock className="size-4" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-widest">
                Sesi Terdekat
              </p>
            </div>
            {data?.sesiTerdekat ? (
              <div className="mt-3">
                <p className="font-display text-lg font-semibold text-foreground">
                  {namaKelompok(data.sesiTerdekat.kelompokId)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatTanggal(data.sesiTerdekat.tanggal)} ·{" "}
                  {formatJam(data.sesiTerdekat.tanggal)} ·{" "}
                  {labelMedia(data.sesiTerdekat.media)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pemateri: {data.sesiTerdekat.pemateri}
                </p>
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 w-full rounded-lg"
                >
                  <Link to="/absensi" data-ocid="dashboard.isi_absensi_button">
                    Isi Absensi Sesi Ini
                  </Link>
                </Button>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Belum ada sesi terjadwal. Sesi baru akan tampil di sini.
              </p>
            )}
          </section>

          <section
            data-ocid="dashboard.halaqah_terendah_card"
            className="animate-fade-up rounded-2xl bg-card p-5 shadow-elevated"
            style={{ animationDelay: "80ms" }}
          >
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="size-4" aria-hidden="true" />
              <p className="text-[11px] font-semibold uppercase tracking-widest">
                Halaqah Terendah
              </p>
            </div>
            {data?.halaqahTerendah ? (
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-semibold text-foreground">
                    {data.halaqahTerendah.nama}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {data.halaqahTerendah.totalHadir.toString()} dari{" "}
                    {data.halaqahTerendah.totalSesi.toString()} sesi
                  </p>
                </div>
                <p className="font-display text-2xl font-bold tabular-nums text-accent-foreground">
                  {formatPersen(data.halaqahTerendah.persentase)}
                </p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Belum ada data kehadiran untuk dihitung.
              </p>
            )}
          </section>

          {!data?.sesiTerdekat && !data?.halaqahTerendah ? (
            <EmptyState
              judul="Belum ada aktivitas"
              deskripsi="Tambahkan peserta dan sesi terlebih dahulu melalui menu Data Master dan Sesi."
              aksi={
                <Button asChild className="rounded-lg">
                  <Link
                    to="/data-master"
                    data-ocid="dashboard.data_master_button"
                  >
                    Buka Data Master
                  </Link>
                </Button>
              }
            />
          ) : null}
        </div>
      )}
    </Layout>
  );
}
