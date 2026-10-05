import { StatusAbsensi } from "@/backend";
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
import { useCheckIn, useSimpanAbsensi } from "@/hooks/use-absensi";
import { useKelompokSaya, usePeran, usePesertaSaya } from "@/hooks/use-role";
import { useDetailSesi, useSesi } from "@/hooks/use-sesi";
import { formatJam, formatTanggal, labelMedia } from "@/lib/format";
import { namaKelompok } from "@/lib/kelompok";
import { cn } from "@/lib/utils";
import type { DraftAbsensi, StatusAbsensi as StatusAbsensiType } from "@/types";
import { useSearch } from "@tanstack/react-router";
import { CheckCircle2, ClipboardCheck, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useMemo, useState } from "react";

const OPSI_STATUS: {
  nilai: StatusAbsensiType;
  label: string;
  aktif: string;
  chip: string;
}[] = [
  {
    nilai: StatusAbsensi.hadir,
    label: "Hadir",
    aktif: "bg-success text-success-foreground border-success",
    chip: "bg-success/10 text-success",
  },
  {
    nilai: StatusAbsensi.izin,
    label: "Izin",
    aktif: "bg-accent text-accent-foreground border-accent",
    chip: "bg-accent/15 text-accent-foreground",
  },
  {
    nilai: StatusAbsensi.sakit,
    label: "Sakit",
    aktif: "bg-warning text-warning-foreground border-warning",
    chip: "bg-warning/15 text-warning-foreground",
  },
  {
    nilai: StatusAbsensi.alpa,
    label: "Alpa",
    aktif: "bg-destructive text-destructive-foreground border-destructive",
    chip: "bg-destructive/10 text-destructive",
  },
];

export function AbsensiPage() {
  const { isAnggota, isAdmin, isLoading: memuatPeran } = usePeran();
  const { sesi: sesiParam, token: tokenParam } = useSearch({
    from: "/absensi",
  });
  const { data: kelompokSaya, isLoading: memuatKelompok } = useKelompokSaya();
  const {
    data: sesiList,
    isLoading: memuatSesi,
    isError: errorSesi,
    refetch,
  } = useSesi();
  const [sesiId, setSesiId] = useState<bigint | null>(null);
  const [draft, setDraft] = useState<DraftAbsensi[]>([]);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const [pesanError, setPesanError] = useState<string | null>(null);

  const { data: detail, isLoading: memuatDetail } = useDetailSesi(sesiId);
  const simpan = useSimpanAbsensi();

  // Ketua halaqah hanya boleh melihat sesi kelompoknya. Admin melihat semua.
  const sesiTersaring = useMemo(() => {
    const daftar = sesiList ?? [];
    if (isAdmin) return daftar;
    if (!kelompokSaya || kelompokSaya.length === 0) return [];
    const diizinkan = new Set(kelompokSaya);
    return daftar.filter((s) => diizinkan.has(s.kelompokId));
  }, [sesiList, isAdmin, kelompokSaya]);

  // Preselect sesi dari parameter pencarian (mis. dari tombol "Isi Absensi").
  useEffect(() => {
    if (sesiId !== null || !sesiParam) return;
    if (sesiTersaring.some((s) => s.id.toString() === sesiParam)) {
      setSesiId(BigInt(sesiParam));
    }
  }, [sesiParam, sesiTersaring, sesiId]);

  // Inisialisasi draft satu kali saat detail sesi termuat.
  useEffect(() => {
    if (!detail) return;
    setDraft(
      detail.peserta.map((p) => ({
        pesertaId: p.pesertaId,
        nama: p.nama,
        status: p.status,
        catatan: p.catatan,
      })),
    );
    setPesanSukses(null);
    setPesanError(null);
  }, [detail]);

  // Ringkasan langsung dari draft yang sedang diedit.
  const ringkasan = useMemo(() => {
    const hitung = { hadir: 0, izin: 0, sakit: 0, alpa: 0 };
    for (const baris of draft) {
      hitung[baris.status] += 1;
    }
    return { ...hitung, total: draft.length };
  }, [draft]);

  function ubahStatus(pesertaId: bigint, status: StatusAbsensiType) {
    setDraft((baris) =>
      baris.map((b) => (b.pesertaId === pesertaId ? { ...b, status } : b)),
    );
    setPesanSukses(null);
  }

  function ubahCatatan(pesertaId: bigint, catatan: string) {
    setDraft((baris) =>
      baris.map((b) => (b.pesertaId === pesertaId ? { ...b, catatan } : b)),
    );
    setPesanSukses(null);
  }

  function simpanAbsensi() {
    if (sesiId === null) return;
    setPesanError(null);
    simpan.mutate(
      {
        sesiId,
        daftar: draft.map((b) => ({
          pesertaId: b.pesertaId,
          status: b.status,
          catatan: b.catatan,
        })),
      },
      {
        onSuccess: (hasil) => {
          setPesanSukses(
            `Tersimpan — Hadir ${hasil.hadir.toString()}, Izin ${hasil.izin.toString()}, Sakit ${hasil.sakit.toString()}, Alpa ${hasil.alpa.toString()}.`,
          );
        },
        onError: (e) => {
          setPesanError(
            e instanceof Error ? e.message : "Gagal menyimpan absensi.",
          );
        },
      },
    );
  }

  if (memuatPeran) {
    return (
      <Layout judul="Absensi" subjudul="Pengisian absensi">
        <ListSkeleton jumlah={3} />
      </Layout>
    );
  }

  if (isAnggota) {
    return (
      <Layout judul="Absensi" subjudul="Check-in mandiri">
        <CheckInMandiri tokenParam={tokenParam} />
      </Layout>
    );
  }

  const memuat = memuatSesi || memuatKelompok;

  return (
    <Layout judul="Absensi" subjudul="Catat kehadiran peserta">
      {memuat ? (
        <ListSkeleton jumlah={3} />
      ) : errorSesi ? (
        <ErrorState onRetry={() => void refetch()} />
      ) : !isAdmin && (kelompokSaya ?? []).length === 0 ? (
        <EmptyState
          judul="Belum ada kelompok"
          deskripsi="Anda belum ditugaskan sebagai ketua halaqah pada kelompok mana pun. Hubungi admin untuk penugasan."
        />
      ) : sesiTersaring.length === 0 ? (
        <EmptyState
          judul="Belum ada sesi"
          deskripsi={
            isAdmin
              ? "Tambahkan sesi terlebih dahulu melalui menu Sesi sebelum mengisi absensi."
              : "Belum ada sesi untuk kelompok Anda. Hubungi admin bila sesi belum dibuat."
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="absensi-sesi">Pilih Sesi</Label>
            <Select
              value={sesiId?.toString() ?? ""}
              onValueChange={(v) => setSesiId(BigInt(v))}
            >
              <SelectTrigger id="absensi-sesi" data-ocid="absensi.sesi_select">
                <SelectValue placeholder="Pilih sesi pertemuan" />
              </SelectTrigger>
              <SelectContent>
                {sesiTersaring.map((s) => (
                  <SelectItem key={s.id.toString()} value={s.id.toString()}>
                    {namaKelompok(s.kelompokId)} · {formatTanggal(s.tanggal)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {sesiId === null ? (
            <EmptyState
              judul="Pilih sesi"
              deskripsi="Pilih salah satu sesi di atas untuk mulai mencatat kehadiran."
            />
          ) : memuatDetail ? (
            <ListSkeleton jumlah={4} />
          ) : !detail ? (
            <ErrorState pesan="Sesi tidak ditemukan." />
          ) : (
            <>
              <section className="rounded-2xl bg-card p-4 shadow-elevated">
                <p className="font-display text-base font-semibold text-foreground">
                  {namaKelompok(detail.sesi.kelompokId)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatTanggal(detail.sesi.tanggal)} ·{" "}
                  {formatJam(detail.sesi.jendelaMulai)}–
                  {formatJam(detail.sesi.jendelaSelesai)} ·{" "}
                  {labelMedia(detail.sesi.media)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pemateri: {detail.sesi.pemateri}
                </p>
              </section>

              <CheckInPanel sesi={detail.sesi} />

              {draft.length === 0 ? (
                <EmptyState
                  judul="Belum ada peserta"
                  deskripsi="Kelompok ini belum memiliki peserta. Tambahkan peserta di Data Master."
                />
              ) : (
                <>
                  <section
                    aria-label="Ringkasan kehadiran"
                    data-ocid="absensi.ringkasan"
                    className="rounded-2xl border border-border bg-card p-4 shadow-subtle"
                  >
                    <div className="flex items-baseline justify-between">
                      <p className="font-display text-sm font-semibold text-foreground">
                        Ringkasan
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {ringkasan.total} peserta
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-2">
                      {OPSI_STATUS.map((opsi) => (
                        <div
                          key={opsi.nilai}
                          data-ocid={`absensi.ringkasan_${opsi.nilai}`}
                          className={cn(
                            "flex flex-col items-center rounded-xl px-1 py-2",
                            opsi.chip,
                          )}
                        >
                          <span className="font-display text-lg font-bold tabular-nums">
                            {ringkasan[opsi.nilai]}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wide">
                            {opsi.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </section>

                  <ul className="flex flex-col gap-3" data-ocid="absensi.list">
                    {draft.map((baris, index) => (
                      <li
                        key={baris.pesertaId.toString()}
                        data-ocid={`absensi.item.${index + 1}`}
                        className="animate-fade-up rounded-2xl bg-card p-4 shadow-elevated"
                        style={{ animationDelay: `${index * 40}ms` }}
                      >
                        <p className="font-medium text-foreground">
                          {baris.nama}
                        </p>
                        <div className="mt-3 grid grid-cols-4 gap-1.5">
                          {OPSI_STATUS.map((opsi) => {
                            const aktif = baris.status === opsi.nilai;
                            return (
                              <button
                                key={opsi.nilai}
                                type="button"
                                aria-pressed={aktif}
                                onClick={() =>
                                  ubahStatus(baris.pesertaId, opsi.nilai)
                                }
                                data-ocid={`absensi.status_${opsi.nilai}.${index + 1}`}
                                className={cn(
                                  "min-h-[40px] rounded-full border px-1 text-[11px] font-semibold uppercase tracking-wide transition-smooth",
                                  aktif
                                    ? opsi.aktif
                                    : "border-border bg-muted/50 text-muted-foreground hover:bg-muted",
                                )}
                              >
                                {opsi.label}
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-3">
                          <Label
                            htmlFor={`catatan-${baris.pesertaId.toString()}`}
                            className="text-xs text-muted-foreground"
                          >
                            Catatan
                          </Label>
                          <Input
                            id={`catatan-${baris.pesertaId.toString()}`}
                            value={baris.catatan}
                            onChange={(e) =>
                              ubahCatatan(baris.pesertaId, e.target.value)
                            }
                            placeholder="Opsional — mis. izin sakit"
                            data-ocid={`absensi.catatan.${index + 1}`}
                            className="mt-1 h-9 rounded-lg"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {pesanSukses ? (
                <p
                  data-ocid="absensi.success_state"
                  className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success"
                >
                  <CheckCircle2
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {pesanSukses}
                </p>
              ) : null}

              {pesanError ? (
                <p
                  data-ocid="absensi.error_state"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {pesanError}
                </p>
              ) : null}

              {draft.length > 0 ? (
                <Button
                  type="button"
                  size="lg"
                  className="w-full rounded-lg"
                  onClick={simpanAbsensi}
                  disabled={simpan.isPending}
                  data-ocid="absensi.submit_button"
                >
                  <ClipboardCheck className="size-4" aria-hidden="true" />
                  {simpan.isPending ? "Menyimpan…" : "Simpan Absensi"}
                </Button>
              ) : null}
            </>
          )}
        </div>
      )}
    </Layout>
  );
}

/** Panel check-in mandiri: tautan + QR + tombol check-in untuk peserta. */
function CheckInPanel({
  sesi,
}: {
  sesi: { checkInToken?: string; jendelaMulai: bigint; jendelaSelesai: bigint };
}) {
  const token = sesi.checkInToken;
  const sekarang = Date.now();
  const mulai = Number(sesi.jendelaMulai / 1_000_000n);
  const selesai = Number(sesi.jendelaSelesai / 1_000_000n);
  const dalamJendela = sekarang >= mulai && sekarang <= selesai;

  const tautan = useMemo(() => {
    if (!token) return "";
    const basis = typeof window !== "undefined" ? window.location.origin : "";
    return `${basis}/absensi?token=${encodeURIComponent(token)}`;
  }, [token]);

  if (!token) {
    return (
      <section
        className="rounded-2xl border border-border bg-card p-4 shadow-subtle"
        data-ocid="absensi.checkin_panel"
      >
        <p className="text-sm text-muted-foreground">
          Token check-in belum tersedia untuk sesi ini.
        </p>
      </section>
    );
  }

  return (
    <section
      className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-subtle"
      data-ocid="absensi.checkin_panel"
    >
      <div className="flex items-center gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <QrCode className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">
            Check-in mandiri peserta
          </p>
          <p className="text-xs text-muted-foreground">
            Pindai QR atau buka tautan selama jendela sesi berlangsung.
          </p>
        </div>
      </div>

      <div className="flex justify-center rounded-xl bg-secondary p-3">
        <QRCodeSVG
          value={tautan}
          size={168}
          level="M"
          marginSize={1}
          aria-label="Kode QR check-in sesi"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="checkin-link" className="text-xs">
          Tautan check-in
        </Label>
        <Input
          id="checkin-link"
          readOnly
          value={tautan}
          onFocus={(e) => e.currentTarget.select()}
          data-ocid="absensi.checkin_link_input"
          className="h-9 rounded-lg text-xs"
        />
      </div>

      <p
        className={cn(
          "rounded-lg px-3 py-2 text-xs",
          dalamJendela
            ? "bg-success/10 text-success"
            : "bg-warning/15 text-warning-foreground",
        )}
        data-ocid="absensi.checkin_window_status"
      >
        {dalamJendela
          ? `Jendela check-in terbuka (${formatJam(sesi.jendelaMulai)}–${formatJam(sesi.jendelaSelesai)}).`
          : `Jendela check-in tertutup. Check-in hanya berlaku ${formatJam(sesi.jendelaMulai)}–${formatJam(sesi.jendelaSelesai)}.`}
      </p>
    </section>
  );
}

/** Tampilan check-in untuk anggota: pilih sesi lalu check-in dengan token. */
function CheckInMandiri({ tokenParam }: { tokenParam?: string }) {
  const { data: sesiList, isLoading, isError, refetch } = useSesi();
  const { data: pesertaSaya, isLoading: memuatPeserta } = usePesertaSaya();
  const checkIn = useCheckIn();
  const [sesiId, setSesiId] = useState<bigint | null>(null);
  const [pesanSukses, setPesanSukses] = useState<string | null>(null);
  const [pesanError, setPesanError] = useState<string | null>(null);

  // Preselect sesi dari token QR/tautan check-in bila tersedia.
  useEffect(() => {
    if (sesiId !== null || !tokenParam) return;
    const cocok = (sesiList ?? []).find((s) => s.checkInToken === tokenParam);
    if (cocok) setSesiId(cocok.id);
  }, [tokenParam, sesiList, sesiId]);

  const sesiTerpilih = useMemo(
    () => (sesiList ?? []).find((s) => s.id === sesiId) ?? null,
    [sesiList, sesiId],
  );

  const dalamJendela = useMemo(() => {
    if (!sesiTerpilih) return false;
    const sekarang = Date.now();
    const mulai = Number(sesiTerpilih.jendelaMulai / 1_000_000n);
    const selesai = Number(sesiTerpilih.jendelaSelesai / 1_000_000n);
    return sekarang >= mulai && sekarang <= selesai;
  }, [sesiTerpilih]);

  function lakukanCheckIn() {
    if (
      !sesiTerpilih?.checkInToken ||
      pesertaSaya === null ||
      pesertaSaya === undefined
    ) {
      setPesanError("Data check-in belum lengkap.");
      return;
    }
    setPesanError(null);
    setPesanSukses(null);
    checkIn.mutate(
      { token: sesiTerpilih.checkInToken, pesertaId: pesertaSaya },
      {
        onSuccess: () => {
          setPesanSukses("Check-in berhasil. Kehadiran Anda tercatat.");
        },
        onError: (e) => {
          setPesanError(
            e instanceof Error ? e.message : "Gagal melakukan check-in.",
          );
        },
      },
    );
  }

  if (isLoading || memuatPeserta) {
    return <ListSkeleton jumlah={3} />;
  }

  if (isError) {
    return <ErrorState onRetry={() => void refetch()} />;
  }

  if (pesertaSaya === null || pesertaSaya === undefined) {
    return (
      <EmptyState
        judul="Belum terdaftar"
        deskripsi="Akun Anda belum terhubung dengan data peserta. Hubungi admin untuk pendaftaran."
      />
    );
  }

  if ((sesiList ?? []).length === 0) {
    return (
      <EmptyState
        judul="Belum ada sesi"
        deskripsi="Belum ada sesi pertemuan yang dapat di-check-in."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="checkin-sesi">Pilih Sesi</Label>
        <Select
          value={sesiId?.toString() ?? ""}
          onValueChange={(v) => {
            setSesiId(BigInt(v));
            setPesanSukses(null);
            setPesanError(null);
          }}
        >
          <SelectTrigger
            id="checkin-sesi"
            data-ocid="absensi.checkin_sesi_select"
          >
            <SelectValue placeholder="Pilih sesi pertemuan" />
          </SelectTrigger>
          <SelectContent>
            {(sesiList ?? []).map((s) => (
              <SelectItem key={s.id.toString()} value={s.id.toString()}>
                {namaKelompok(s.kelompokId)} · {formatTanggal(s.tanggal)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {sesiTerpilih ? (
        <section className="rounded-2xl bg-card p-4 shadow-elevated">
          <p className="font-display text-base font-semibold text-foreground">
            {namaKelompok(sesiTerpilih.kelompokId)}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatTanggal(sesiTerpilih.tanggal)} ·{" "}
            {formatJam(sesiTerpilih.jendelaMulai)}–
            {formatJam(sesiTerpilih.jendelaSelesai)}
          </p>
          <p
            className={cn(
              "mt-3 rounded-lg px-3 py-2 text-xs",
              dalamJendela
                ? "bg-success/10 text-success"
                : "bg-warning/15 text-warning-foreground",
            )}
            data-ocid="absensi.checkin_window_status"
          >
            {dalamJendela
              ? "Jendela check-in terbuka. Anda dapat melakukan check-in sekarang."
              : `Jendela check-in tertutup. Check-in hanya berlaku ${formatJam(sesiTerpilih.jendelaMulai)}–${formatJam(sesiTerpilih.jendelaSelesai)}.`}
          </p>
        </section>
      ) : (
        <EmptyState
          judul="Pilih sesi"
          deskripsi="Pilih sesi di atas untuk melakukan check-in."
        />
      )}

      {pesanSukses ? (
        <p
          data-ocid="absensi.checkin_success_state"
          className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {pesanSukses}
        </p>
      ) : null}

      {pesanError ? (
        <p
          data-ocid="absensi.checkin_error_state"
          className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {pesanError}
        </p>
      ) : null}

      {sesiTerpilih ? (
        <Button
          type="button"
          size="lg"
          className="w-full rounded-lg"
          onClick={lakukanCheckIn}
          disabled={checkIn.isPending || !dalamJendela}
          data-ocid="absensi.checkin_button"
        >
          <ClipboardCheck className="size-4" aria-hidden="true" />
          {checkIn.isPending ? "Memproses…" : "Check-in Sekarang"}
        </Button>
      ) : null}
    </div>
  );
}
