import { createActor } from "@/backend";
import type {
  DuplikatInput,
  Sesi,
  SesiDetail,
  SesiFilter,
  SesiId,
  SesiInput,
} from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useSesi(filter: SesiFilter = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: [
      "sesi",
      filter.kelompokId ?? "",
      filter.mapelId?.toString() ?? "",
      filter.bulan?.toString() ?? "",
      filter.tahun?.toString() ?? "",
    ],
    queryFn: async (): Promise<Sesi[]> => {
      if (!actor) return [];
      return actor.listSesi(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useDetailSesi(id: SesiId | null) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["sesi-detail", id?.toString() ?? ""],
    queryFn: async (): Promise<SesiDetail | null> => {
      if (!actor || id === null) return null;
      return actor.detailSesi(id);
    },
    enabled: !!actor && !isFetching && id !== null,
  });
}

export function useBuatSesi() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: SesiInput): Promise<Sesi> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.buatSesi(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sesi"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useUbahSesi() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: SesiId;
      input: SesiInput;
    }): Promise<Sesi | null> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.ubahSesi(id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sesi"] });
      void queryClient.invalidateQueries({ queryKey: ["sesi-detail"] });
    },
  });
}

export function useHapusSesi() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: SesiId): Promise<boolean> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.hapusSesi(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sesi"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDuplikatSesi() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: DuplikatInput): Promise<Sesi[]> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.duplikatSesi(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sesi"] });
    },
  });
}
