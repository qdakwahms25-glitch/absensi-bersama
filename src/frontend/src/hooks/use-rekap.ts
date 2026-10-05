import { createActor } from "@/backend";
import type {
  AmbangInput,
  DashboardRingkasan,
  RekapBulanan,
  RekapFilter,
  RekapKelompok,
  RekapPeserta,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

function kunciRekap(filter: RekapFilter): string {
  return [
    filter.kelompokId ?? "",
    filter.bulan?.toString() ?? "",
    filter.tahun?.toString() ?? "",
  ].join("|");
}

export function useRekapPerPeserta(filter: RekapFilter = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["rekap", "peserta", kunciRekap(filter)],
    queryFn: async (): Promise<RekapPeserta[]> => {
      if (!actor) return [];
      return actor.rekapPerPeserta(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRekapPerKelompok(filter: RekapFilter = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["rekap", "kelompok", kunciRekap(filter)],
    queryFn: async (): Promise<RekapKelompok[]> => {
      if (!actor) return [];
      return actor.rekapPerKelompok(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRekapBulanan(bulan: number, tahun: number) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["rekap", "bulanan", bulan, tahun],
    queryFn: async (): Promise<RekapBulanan | null> => {
      if (!actor) return null;
      return actor.rekapBulanan(BigInt(bulan), BigInt(tahun));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDashboard() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async (): Promise<DashboardRingkasan | null> => {
      if (!actor) return null;
      return actor.dashboard();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAmbang() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["ambang"],
    queryFn: async (): Promise<number> => {
      if (!actor) return 75;
      return actor.getAmbang();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetAmbang() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: AmbangInput): Promise<number> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.setAmbang(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["ambang"] });
      void queryClient.invalidateQueries({ queryKey: ["rekap"] });
    },
  });
}

export function useEksporRekap() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      format,
      filter,
    }: {
      format: "pdf" | "excel";
      filter: RekapFilter;
    }): Promise<Uint8Array> => {
      if (!actor) throw new Error("Backend belum siap");
      return format === "pdf"
        ? actor.eksporRekapPdf(filter)
        : actor.eksporRekapExcel(filter);
    },
  });
}
