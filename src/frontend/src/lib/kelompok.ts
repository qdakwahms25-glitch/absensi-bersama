import type { Kelompok, KelompokId } from "@/types";

/**
 * Kelompok tetap sesuai backend `lib/rekap.mo`:
 * Asatidz & Karyawan (Halaqah 1-6) dan Musyrifah.
 */
export const KELOMPOK_TETAP: Kelompok[] = [
  { id: "asatidz-h1", nama: "Halaqah 1", halaqah: 1 },
  { id: "asatidz-h2", nama: "Halaqah 2", halaqah: 2 },
  { id: "asatidz-h3", nama: "Halaqah 3", halaqah: 3 },
  { id: "asatidz-h4", nama: "Halaqah 4", halaqah: 4 },
  { id: "asatidz-h5", nama: "Halaqah 5", halaqah: 5 },
  { id: "asatidz-h6", nama: "Halaqah 6", halaqah: 6 },
  { id: "musyrifah", nama: "Musyrifah", halaqah: null },
];

export function namaKelompok(id: KelompokId): string {
  return KELOMPOK_TETAP.find((k) => k.id === id)?.nama ?? id;
}

export function kelompokById(id: KelompokId): Kelompok | undefined {
  return KELOMPOK_TETAP.find((k) => k.id === id);
}
