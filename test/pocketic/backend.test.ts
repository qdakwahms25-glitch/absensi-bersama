import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

// Timestamp nanodetik: 2026-10-05T09:00:00Z.
const TANGGAL = 1_759_654_800_000_000_000n;
const JENDELA_MULAI = TANGGAL;
const JENDELA_SELESAI = TANGGAL + 3_600_000_000_000n;

// Filter lengkap: Candid menolak record yang kehilangan field, jadi setiap
// filter harus menyertakan seluruh field opsionalnya (sebagai `[]` bila kosong).
const FILTER_PESERTA = { nama: [], kelompokId: [] } as const;
const FILTER_SESI = { tahun: [], kelompokId: [], mapelId: [], bulan: [] } as const;
const FILTER_REKAP = { tahun: [], kelompokId: [], bulan: [] } as const;

// Pemanggil pertama yang terautentikasi menjadi admin. Identitas deterministik
// dari @dfinity/pic memberi principal non-anonim yang stabil lintas run.
const admin = createIdentity("admin-absensi");

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
    sender: admin.getPrincipal(),
  }));
  actor.setIdentity(admin);
  // Registrasi pemanggil pertama: menjadikannya admin, sehingga endpoint yang
  // dijaga tidak menolak dengan "User is not registered".
  await actor._initialize_access_control();
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  await expect(actor.listPeserta(FILTER_PESERTA)).resolves.toEqual([]);
  await expect(actor.listMapel()).resolves.toEqual([]);
  await expect(actor.listSesi(FILTER_SESI)).resolves.toEqual([]);
  await expect(actor.getAmbang()).resolves.toBe(75);
  await expect(actor.getApiDoc()).resolves.toContain("Absensi Belajar Bersama");
});

it("round-trips a peserta and a mapel through the real canister", async () => {
  const peserta = await actor.tambahPeserta({ nama: "Ahmad", kelompokId: "asatidz-h1" });
  expect(peserta).toMatchObject({ nama: "Ahmad", kelompokId: "asatidz-h1" });

  const mapel = await actor.tambahMapel({ nama: "Tajwid" });
  expect(mapel).toMatchObject({ nama: "Tajwid" });

  const daftar = await actor.listPeserta(FILTER_PESERTA);
  expect(daftar).toContainEqual(expect.objectContaining({ id: peserta.id, nama: "Ahmad" }));
});

it("creates a sesi and reads it back through detailSesi", async () => {
  const mapel = await actor.tambahMapel({ nama: "Fiqih" });
  const sesi = await actor.buatSesi({
    tanggal: TANGGAL,
    kelompokId: "asatidz-h2",
    mapelId: mapel.id,
    pemateri: "Ustadz Ali",
    media: { tatapMuka: null },
    tempat: ["Ruang A"],
    jendelaMulai: JENDELA_MULAI,
    jendelaSelesai: JENDELA_SELESAI,
  });
  expect(sesi).toMatchObject({ kelompokId: "asatidz-h2", pemateri: "Ustadz Ali" });

  const detail = await actor.detailSesi(sesi.id);
  expect(detail).toHaveLength(1);
  expect(detail[0]?.sesi.id).toBe(sesi.id);
});

it("duplicates a sesi onto a chosen date with the same data", async () => {
  const mapel = await actor.tambahMapel({ nama: "Hadits" });
  const sumber = await actor.buatSesi({
    tanggal: TANGGAL,
    kelompokId: "asatidz-h3",
    mapelId: mapel.id,
    pemateri: "Ustadzah Nisa",
    media: { zoom: null },
    tempat: [],
    jendelaMulai: JENDELA_MULAI,
    jendelaSelesai: JENDELA_SELESAI,
  });

  const tujuan = TANGGAL + 7n * 86_400_000_000_000n;
  const hasil = await actor.duplikatSesi({ sesiId: sumber.id, tanggalTujuan: [tujuan] });
  expect(hasil).toHaveLength(1);
  expect(hasil[0]).toMatchObject({
    tanggal: tujuan,
    kelompokId: sumber.kelompokId,
    mapelId: sumber.mapelId,
    pemateri: sumber.pemateri,
  });
});

it("saves absensi for a whole kelompok and reads the statuses back", async () => {
  const mapel = await actor.tambahMapel({ nama: "Aqidah" });
  const p1 = await actor.tambahPeserta({ nama: "Budi", kelompokId: "asatidz-h4" });
  const p2 = await actor.tambahPeserta({ nama: "Citra", kelompokId: "asatidz-h4" });
  const sesi = await actor.buatSesi({
    tanggal: TANGGAL,
    kelompokId: "asatidz-h4",
    mapelId: mapel.id,
    pemateri: "Ustadz Hasan",
    media: { tatapMuka: null },
    tempat: [],
    jendelaMulai: JENDELA_MULAI,
    jendelaSelesai: JENDELA_SELESAI,
  });

  const ringkasan = await actor.simpanAbsensi({
    sesiId: sesi.id,
    daftar: [
      { pesertaId: p1.id, status: { hadir: null }, catatan: "" },
      { pesertaId: p2.id, status: { izin: null }, catatan: "sakit" },
    ],
  });
  expect(ringkasan).toMatchObject({ hadir: 1n, izin: 1n, sakit: 0n, alpa: 0n, total: 2n });

  const detail = await actor.detailSesi(sesi.id);
  const baris = detail[0]?.peserta ?? [];
  expect(baris).toContainEqual(expect.objectContaining({ pesertaId: p1.id, status: { hadir: null } }));
  expect(baris).toContainEqual(
    expect.objectContaining({ pesertaId: p2.id, status: { izin: null }, catatan: "sakit" }),
  );
});

it("reports rekap per peserta with the ambang marker", async () => {
  const mapel = await actor.tambahMapel({ nama: "Nahwu" });
  const peserta = await actor.tambahPeserta({ nama: "Dedi", kelompokId: "asatidz-h5" });
  const sesi = await actor.buatSesi({
    tanggal: TANGGAL,
    kelompokId: "asatidz-h5",
    mapelId: mapel.id,
    pemateri: "Ustadz Idris",
    media: { tatapMuka: null },
    tempat: [],
    jendelaMulai: JENDELA_MULAI,
    jendelaSelesai: JENDELA_SELESAI,
  });
  await actor.simpanAbsensi({
    sesiId: sesi.id,
    daftar: [{ pesertaId: peserta.id, status: { alpa: null }, catatan: "" }],
  });

  const rekap = await actor.rekapPerPeserta(FILTER_REKAP);
  const baris = rekap.find((r) => r.pesertaId === peserta.id);
  expect(baris).toBeDefined();
  expect(baris?.diBawahAmbang).toBe(true);
});

it("changes the ambang and reflects it in the rekap marker", async () => {
  const baru = await actor.setAmbang({ persentase: 0 });
  expect(baru).toBe(0);
  await expect(actor.getAmbang()).resolves.toBe(0);

  const rekap = await actor.rekapPerPeserta(FILTER_REKAP);
  expect(rekap.every((r) => r.diBawahAmbang === false)).toBe(true);
});

it("exports rekap as a PDF blob and an Excel/CSV blob", async () => {
  const pdf = await actor.eksporRekapPdf(FILTER_REKAP);
  expect(new TextDecoder().decode(pdf.slice(0, 5))).toBe("%PDF-");

  const excel = await actor.eksporRekapExcel(FILTER_REKAP);
  const teks = new TextDecoder().decode(excel);
  expect(teks).toContain("Nama;Kelompok;Total Sesi;Hadir;Persentase;Di Bawah Ambang");
});

it("returns a dashboard summary with the current-month attendance", async () => {
  const ringkasan = await actor.dashboard();
  expect(typeof ringkasan.kehadiranBulanIni).toBe("number");
  expect(ringkasan.kehadiranBulanIni).toBeGreaterThanOrEqual(0);
});
