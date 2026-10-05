import type {
  Absensi,
  AbsensiInput,
  AmbangInput,
  CheckInInput,
  DashboardRingkasan,
  DuplikatInput,
  KelompokId,
  MapelId,
  MataPelajaran,
  MataPelajaranInput,
  MediaSesi,
  Peserta,
  PesertaAbsensiView,
  PesertaFilter,
  PesertaId,
  PesertaInput,
  RekapBulanan,
  RekapFilter,
  RekapKelompok,
  RekapPeserta,
  RingkasanStatus,
  Sesi,
  SesiDetail,
  SesiFilter,
  SesiId,
  SesiInput,
  SesiRingkas,
  SimpanAbsensiInput,
  StatusAbsensi,
  Timestamp,
} from "@/backend";
import {
  MediaSesi as MediaSesiEnum,
  StatusAbsensi as StatusAbsensiEnum,
} from "@/backend";

export type {
  Absensi,
  AbsensiInput,
  AmbangInput,
  CheckInInput,
  DashboardRingkasan,
  DuplikatInput,
  KelompokId,
  MapelId,
  MataPelajaran,
  MataPelajaranInput,
  MediaSesi,
  Peserta,
  PesertaAbsensiView,
  PesertaFilter,
  PesertaId,
  PesertaInput,
  RekapBulanan,
  RekapFilter,
  RekapKelompok,
  RekapPeserta,
  RingkasanStatus,
  Sesi,
  SesiDetail,
  SesiFilter,
  SesiId,
  SesiInput,
  SesiRingkas,
  SimpanAbsensiInput,
  StatusAbsensi,
  Timestamp,
};

// Backend enums are runtime values — re-export them as values so pages can
// compare against `StatusAbsensi.hadir` / `MediaSesi.tatapMuka`.
export { MediaSesiEnum, StatusAbsensiEnum };

/** Peran aplikasi yang dipakai antarmuka (dipetakan dari UserRole backend). */
export type PeranApp = "admin" | "ketuaHalaqah" | "anggota";

export interface Kelompok {
  id: KelompokId;
  nama: string;
  halaqah: number | null;
}

/** Satu baris status absensi yang sedang diedit di layar Absensi. */
export interface DraftAbsensi {
  pesertaId: PesertaId;
  nama: string;
  status: StatusAbsensi;
  catatan: string;
}
