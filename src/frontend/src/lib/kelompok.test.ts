import { describe, expect, it } from "vitest";

import { KELOMPOK_TETAP, kelompokById, namaKelompok } from "@/lib/kelompok";

describe("kelompok", () => {
  it("lists the seven fixed kelompok with their halaqah numbers", () => {
    expect(KELOMPOK_TETAP).toHaveLength(7);
    expect(KELOMPOK_TETAP.map((k) => k.id)).toEqual([
      "asatidz-h1",
      "asatidz-h2",
      "asatidz-h3",
      "asatidz-h4",
      "asatidz-h5",
      "asatidz-h6",
      "musyrifah",
    ]);
    expect(kelompokById("musyrifah")?.halaqah).toBeNull();
  });

  it("resolves a display name and falls back to the raw id", () => {
    expect(namaKelompok("asatidz-h1")).toBe("Halaqah 1");
    expect(namaKelompok("musyrifah")).toBe("Musyrifah");
    expect(namaKelompok("tidak-dikenal")).toBe("tidak-dikenal");
  });
});
