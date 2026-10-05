import { UserRole, createActor } from "@/backend";
import type { KelompokId, PeranApp, PesertaId } from "@/types";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

export interface HasilPeran {
  peran: PeranApp;
  isAdmin: boolean;
  isKetuaHalaqah: boolean;
  isAnggota: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Peran aplikasi diturunkan dari UserRole backend:
 * admin -> admin, user -> ketua halaqah (pengurus), guest -> anggota.
 */
export function usePeran(): HasilPeran {
  const { isAuthenticated, isInitializing } = useInternetIdentity();
  const { actor, isFetching } = useActor(createActor);

  const { data, isLoading } = useQuery({
    queryKey: ["peran"],
    queryFn: async (): Promise<UserRole> => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
  });

  const peran: PeranApp =
    data === UserRole.admin
      ? "admin"
      : data === UserRole.user
        ? "ketuaHalaqah"
        : "anggota";

  // Peran belum dapat dipercaya selama query masih berjalan: jangan biarkan
  // halaman menampilkan "Akses terbatas" ke admin/ketua sebelum peran termuat.
  const sedangMemuatPeran = isInitializing || (isAuthenticated && isLoading);

  return {
    peran,
    isAdmin: peran === "admin",
    isKetuaHalaqah: peran === "ketuaHalaqah",
    isAnggota: peran === "anggota",
    isLoading: sedangMemuatPeran,
    isAuthenticated,
  };
}

/**
 * Kelompok yang boleh diakses pemanggil. Admin mengembalikan daftar kosong
 * (berarti semua kelompok); ketua halaqah mengembalikan kelompok yang
 * ditugaskan; anggota tidak memiliki kelompok.
 */
export function useKelompokSaya() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["kelompok-saya"],
    queryFn: async (): Promise<KelompokId[]> => {
      if (!actor) return [];
      return actor.getKelompokSaya();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Peserta yang terhubung dengan pemanggil (untuk anggota). */
export function usePesertaSaya() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["peserta-saya"],
    queryFn: async (): Promise<PesertaId | null> => {
      if (!actor) return null;
      return actor.getPesertaSaya();
    },
    enabled: !!actor && !isFetching,
  });
}
