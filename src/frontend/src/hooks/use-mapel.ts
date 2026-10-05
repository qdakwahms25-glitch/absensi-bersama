import { createActor } from "@/backend";
import type { MapelId, MataPelajaran, MataPelajaranInput } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useMapel() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["mapel"],
    queryFn: async (): Promise<MataPelajaran[]> => {
      if (!actor) return [];
      return actor.listMapel();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTambahMapel() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: MataPelajaranInput): Promise<MataPelajaran> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.tambahMapel(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mapel"] });
    },
  });
}

export function useUbahMapel() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: MapelId;
      input: MataPelajaranInput;
    }): Promise<MataPelajaran | null> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.ubahMapel(id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mapel"] });
    },
  });
}

export function useHapusMapel() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: MapelId): Promise<boolean> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.hapusMapel(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mapel"] });
    },
  });
}
