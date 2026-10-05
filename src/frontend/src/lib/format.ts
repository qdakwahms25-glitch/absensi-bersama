import { MediaSesi, StatusAbsensi } from "@/backend";
import type { Timestamp } from "@/types";

const HARI = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
const BULAN_SINGKAT = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MEI",
  "JUN",
  "JUL",
  "AGU",
  "SEP",
  "OKT",
  "NOV",
  "DES",
];
const BULAN_PANJANG = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/**
 * Timestamp backend adalah nanodetik sejak epoch Unix (bigint).
 * Selalu lewatkan nilai backend melalui helper ini sebelum operasi Date.
 */
export function timestampToDate(timestamp: Timestamp): Date | null {
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTanggal(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "Tanggal tidak valid";
  return `${date.getDate()} ${BULAN_PANJANG[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatTanggalSingkat(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return `${date.getDate()} ${BULAN_SINGKAT[date.getMonth()]}`;
}

/** Format chip tanggal sesuai desain: "SEN, 23 OKT". */
export function formatChipTanggal(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return `${HARI[date.getDay()]}, ${date.getDate()} ${BULAN_SINGKAT[date.getMonth()]}`;
}

export function formatHari(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return HARI[date.getDay()];
}

export function formatJam(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const jam = date.getHours().toString().padStart(2, "0");
  const menit = date.getMinutes().toString().padStart(2, "0");
  return `${jam}.${menit}`;
}

export function formatPersen(nilai: number): string {
  return `${nilai.toFixed(1)}%`;
}

export function labelMedia(media: MediaSesi): string {
  switch (media) {
    case MediaSesi.tatapMuka:
      return "Tatap Muka";
    case MediaSesi.zoom:
      return "Zoom";
    case MediaSesi.whatsapp:
      return "WhatsApp";
    default:
      return "Tatap Muka";
  }
}

export function labelStatus(status: StatusAbsensi): string {
  switch (status) {
    case StatusAbsensi.hadir:
      return "Hadir";
    case StatusAbsensi.izin:
      return "Izin";
    case StatusAbsensi.sakit:
      return "Sakit";
    case StatusAbsensi.alpa:
      return "Alpa";
    default:
      return "Hadir";
  }
}

/** Ubah nilai input datetime-local menjadi Timestamp nanodetik. */
export function dateToTimestamp(value: string): Timestamp {
  const ms = new Date(value).getTime();
  return BigInt(Number.isNaN(ms) ? Date.now() : ms) * 1_000_000n;
}

/** Ubah Timestamp nanodetik menjadi nilai untuk input datetime-local. */
export function timestampToInputValue(timestamp: Timestamp): string {
  const date = timestampToDate(timestamp);
  if (!date) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function namaBulan(bulan: number): string {
  return BULAN_PANJANG[bulan - 1] ?? "";
}

export const DAFTAR_BULAN = BULAN_PANJANG.map((nama, index) => ({
  nilai: index + 1,
  nama,
}));
