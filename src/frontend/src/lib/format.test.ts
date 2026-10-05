import { describe, expect, it } from "vitest";

import { MediaSesi, StatusAbsensi } from "@/backend";
import {
  DAFTAR_BULAN,
  dateToTimestamp,
  formatChipTanggal,
  formatJam,
  formatPersen,
  formatTanggal,
  labelMedia,
  labelStatus,
  timestampToDate,
  timestampToInputValue,
} from "@/lib/format";

describe("format", () => {
  it("formats a nanosecond timestamp as an Indonesian long date", () => {
    // 2026-10-05T09:30:00Z
    const ts = 1_791_192_600_000_000_000n;
    expect(formatTanggal(ts)).toBe("5 Oktober 2026");
    expect(formatJam(ts)).toBe("09.30");
    expect(formatChipTanggal(ts)).toBe("SEN, 5 OKT");
  });

  it("round-trips a timestamp through the datetime-local input value", () => {
    const ts = 1_791_192_600_000_000_000n;
    const value = timestampToInputValue(ts);
    expect(value).toBe("2026-10-05T09:30");
    expect(dateToTimestamp(value)).toBe(ts);
  });

  it("returns safe fallbacks for an invalid timestamp", () => {
    expect(timestampToDate(0n)).toBeInstanceOf(Date);
    expect(formatPersen(87.5)).toBe("87.5%");
  });

  it("labels media and status in Indonesian", () => {
    expect(labelMedia(MediaSesi.tatapMuka)).toBe("Tatap Muka");
    expect(labelMedia(MediaSesi.zoom)).toBe("Zoom");
    expect(labelMedia(MediaSesi.whatsapp)).toBe("WhatsApp");
    expect(labelStatus(StatusAbsensi.hadir)).toBe("Hadir");
    expect(labelStatus(StatusAbsensi.izin)).toBe("Izin");
    expect(labelStatus(StatusAbsensi.sakit)).toBe("Sakit");
    expect(labelStatus(StatusAbsensi.alpa)).toBe("Alpa");
  });

  it("exposes the twelve Indonesian month names", () => {
    expect(DAFTAR_BULAN).toHaveLength(12);
    expect(DAFTAR_BULAN[0]).toEqual({ nilai: 1, nama: "Januari" });
    expect(DAFTAR_BULAN[11]).toEqual({ nilai: 12, nama: "Desember" });
  });
});
