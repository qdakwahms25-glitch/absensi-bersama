import { createActor } from "@/backend";
import type { Peserta, PesertaFilter, PesertaId, PesertaInput } from "@/types";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function usePeserta(filter: PesertaFilter = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["peserta", filter.nama ?? "", filter.kelompokId ?? ""],
    queryFn: async (): Promise<Peserta[]> => {
      if (!actor) return [];
      return actor.listPeserta(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTambahPeserta() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: PesertaInput): Promise<Peserta> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.tambahPeserta(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["peserta"] });
    },
  });
}

export function useUbahPeserta() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: PesertaId;
      input: PesertaInput;
    }): Promise<Peserta | null> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.ubahPeserta(id, input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["peserta"] });
    },
  });
}

export function useHapusPeserta() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: PesertaId): Promise<boolean> => {
      if (!actor) throw new Error("Backend belum siap");
      return actor.hapusPeserta(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["peserta"] });
    },
  });
}
