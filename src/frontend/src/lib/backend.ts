import { createActorWithConfig } from "@caffeineai/core-infrastructure";
import { createActor } from "@/backend";

/**
 * Pembungkus pembuatan aktor backend. Dipakai oleh `useActor(createActor)` di
 * seluruh hook React Query sehingga konfigurasi canister tetap satu sumber.
 */
export function buatActor() {
  return createActorWithConfig(createActor);
}
