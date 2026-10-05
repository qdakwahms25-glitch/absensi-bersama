import { createActor } from "@/backend";
import type {
  Absensi,
  CheckInInput,
  RingkasanStatus,
  SesiId,
  SimpanAbsensiInput,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useAbsensiSesi(sesiId: SesiId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["absensi", sesiId?.toString() ?? ""],
    queryFn: async (): Promise<Absensi[]> => {
      if (!actor || sesiId === null) return [];
      return actor.getAbsensiSesi(sesiId);
    },
    enabled: !!actor && !isFetching && sesiId !== null,
  });
}

export function useRingkasanSesi(sesiId: SesiId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["ringkasan-sesi", sesiId?.toString() ?? ""],
    queryFn: async (): Promise<RingkasanStatus | null> => {
      if (!actor || sesiId === null) return null;
      return actor.ringkasanSesi(sesiId);
    },
    enabled: !!actor && !isFetching && sesiId !== null,
  });
}

export function useSimpanAbsensi() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SimpanAbsensiInput): Promise<RingkasanStatus> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.simpanAbsensi(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["absensi"] });
      void queryClient.invalidateQueries({ queryKey: ["ringkasan-sesi"] });
      void queryClient.invalidateQueries({ queryKey: ["sesi-detail"] });
      void queryClient.invalidateQueries({ queryKey: ["rekap"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useCheckIn() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CheckInInput): Promise<Absensi> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.checkIn(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["absensi"] });
      void queryClient.invalidateQueries({ queryKey: ["rekap"] });
    },
  });
}
