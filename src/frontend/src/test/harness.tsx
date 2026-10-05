import type { ReactNode } from "react";
import { vi } from "vitest";

import type { UserRole } from "@/backend";
import { UserRole as UserRoleEnum } from "@/backend";

export { buatRouterMock } from "@/test/router-mock";

/**
 * Typed local actor mock. Every method the pages call is present so a missing
 * implementation fails loudly instead of silently returning undefined.
 */
export interface ActorMock {
  getCallerUserRole: ReturnType<typeof vi.fn>;
  getKelompokSaya: ReturnType<typeof vi.fn>;
  getPesertaSaya: ReturnType<typeof vi.fn>;
  listPeserta: ReturnType<typeof vi.fn>;
  tambahPeserta: ReturnType<typeof vi.fn>;
  ubahPeserta: ReturnType<typeof vi.fn>;
  hapusPeserta: ReturnType<typeof vi.fn>;
  listMapel: ReturnType<typeof vi.fn>;
  tambahMapel: ReturnType<typeof vi.fn>;
  ubahMapel: ReturnType<typeof vi.fn>;
  hapusMapel: ReturnType<typeof vi.fn>;
  listSesi: ReturnType<typeof vi.fn>;
  detailSesi: ReturnType<typeof vi.fn>;
  buatSesi: ReturnType<typeof vi.fn>;
  ubahSesi: ReturnType<typeof vi.fn>;
  hapusSesi: ReturnType<typeof vi.fn>;
  duplikatSesi: ReturnType<typeof vi.fn>;
  simpanAbsensi: ReturnType<typeof vi.fn>;
  checkIn: ReturnType<typeof vi.fn>;
  getAbsensiSesi: ReturnType<typeof vi.fn>;
  ringkasanSesi: ReturnType<typeof vi.fn>;
  rekapPerPeserta: ReturnType<typeof vi.fn>;
  rekapPerKelompok: ReturnType<typeof vi.fn>;
  rekapBulanan: ReturnType<typeof vi.fn>;
  dashboard: ReturnType<typeof vi.fn>;
  getAmbang: ReturnType<typeof vi.fn>;
  setAmbang: ReturnType<typeof vi.fn>;
  eksporRekapPdf: ReturnType<typeof vi.fn>;
  eksporRekapExcel: ReturnType<typeof vi.fn>;
}

export function buatActorMock(overrides: Partial<ActorMock> = {}): ActorMock {
  const dasar: ActorMock = {
    getCallerUserRole: vi.fn(async () => UserRoleEnum.admin),
    getKelompokSaya: vi.fn(async () => []),
    getPesertaSaya: vi.fn(async () => null),
    listPeserta: vi.fn(async () => []),
    tambahPeserta: vi.fn(
      async (input: { nama: string; kelompokId: string }) => ({
        id: 1n,
        nama: input.nama,
        kelompokId: input.kelompokId,
      }),
    ),
    ubahPeserta: vi.fn(async () => null),
    hapusPeserta: vi.fn(async () => true),
    listMapel: vi.fn(async () => []),
    tambahMapel: vi.fn(async (input: { nama: string }) => ({
      id: 1n,
      nama: input.nama,
    })),
    ubahMapel: vi.fn(async () => null),
    hapusMapel: vi.fn(async () => true),
    listSesi: vi.fn(async () => []),
    detailSesi: vi.fn(async () => null),
    buatSesi: vi.fn(async () => {
      throw new Error("buatSesi belum di-stub");
    }),
    ubahSesi: vi.fn(async () => null),
    hapusSesi: vi.fn(async () => true),
    duplikatSesi: vi.fn(async () => []),
    simpanAbsensi: vi.fn(async () => ({
      hadir: 0n,
      izin: 0n,
      sakit: 0n,
      alpa: 0n,
      total: 0n,
    })),
    checkIn: vi.fn(async () => {
      throw new Error("checkIn belum di-stub");
    }),
    getAbsensiSesi: vi.fn(async () => []),
    ringkasanSesi: vi.fn(async () => ({
      hadir: 0n,
      izin: 0n,
      sakit: 0n,
      alpa: 0n,
      total: 0n,
    })),
    rekapPerPeserta: vi.fn(async () => []),
    rekapPerKelompok: vi.fn(async () => []),
    rekapBulanan: vi.fn(async () => ({
      bulan: 1n,
      tahun: 2026n,
      totalSesi: 0n,
      totalHadir: 0n,
      persentase: 0,
    })),
    dashboard: vi.fn(async () => ({ kehadiranBulanIni: 0 })),
    getAmbang: vi.fn(async () => 75),
    setAmbang: vi.fn(async (input: { persentase: number }) => input.persentase),
    eksporRekapPdf: vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46])),
    eksporRekapExcel: vi.fn(async () =>
      new TextEncoder().encode("Nama;Kelompok\n"),
    ),
  };
  return { ...dasar, ...overrides };
}

export interface IdentityMock {
  isAuthenticated: boolean;
  isInitializing: boolean;
  login: ReturnType<typeof vi.fn>;
  clear: ReturnType<typeof vi.fn>;
  loginStatus: string;
  isLoggingIn: boolean;
  isLoginError: boolean;
  loginError?: Error;
}

export function buatIdentityMock(
  overrides: Partial<IdentityMock> = {},
): IdentityMock {
  return {
    isAuthenticated: true,
    isInitializing: false,
    login: vi.fn(),
    clear: vi.fn(),
    loginStatus: "success",
    isLoggingIn: false,
    isLoginError: false,
    ...overrides,
  };
}

export type Peran = "admin" | "ketuaHalaqah" | "anggota";

export function roleUntuk(peran: Peran): UserRole {
  if (peran === "admin") return UserRoleEnum.admin;
  if (peran === "ketuaHalaqah") return UserRoleEnum.user;
  return UserRoleEnum.guest;
}

export interface RenderOptions {
  peran?: Peran;
  actor?: Partial<ActorMock>;
  identity?: Partial<IdentityMock>;
}

export interface Harness {
  actor: ActorMock;
  identity: IdentityMock;
  wrapper: ({ children }: { children: ReactNode }) => ReactNode;
}
