import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MediaSesi, StatusAbsensi } from "@/backend";
import { AbsensiPage } from "@/pages/Absensi";
import { buatActorMock, buatIdentityMock, roleUntuk } from "@/test/harness";

const actorRef = { current: buatActorMock() };
const identityRef = { current: buatIdentityMock() };

// `vi.hoisted` runs before imports, so the router mock is built from a module
// loaded dynamically here rather than from a top-level import binding (which
// would still be in its temporal dead zone when the hoisted factory runs).
const routerMock = vi.hoisted(async () => {
  const { buatRouterMock } = await import("@/test/router-mock");
  return buatRouterMock;
});

vi.mock("@caffeineai/core-infrastructure", () => ({
  useActor: () => ({ actor: actorRef.current, isFetching: false }),
  useInternetIdentity: () => identityRef.current,
}));

vi.mock("@tanstack/react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@tanstack/react-router")>()),
  ...(await routerMock)("/absensi"),
  useSearch: () => ({}),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const TANGGAL = 1_759_654_800_000_000_000n;

const SESI = {
  id: 7n,
  tanggal: TANGGAL,
  kelompokId: "asatidz-h1",
  mapelId: 3n,
  pemateri: "Ustadz Ali",
  media: MediaSesi.tatapMuka,
  tempat: "Ruang A",
  jendelaMulai: TANGGAL,
  jendelaSelesai: TANGGAL + 3_600_000_000_000n,
  checkInToken: "sesi-7-token",
};

const DETAIL = {
  sesi: SESI,
  peserta: [
    { pesertaId: 1n, nama: "Ahmad", status: StatusAbsensi.hadir, catatan: "" },
    { pesertaId: 2n, nama: "Budi", status: StatusAbsensi.hadir, catatan: "" },
  ],
};

beforeEach(() => {
  actorRef.current = buatActorMock();
  identityRef.current = buatIdentityMock();
  actorRef.current.listSesi.mockResolvedValue([SESI]);
  actorRef.current.detailSesi.mockResolvedValue(DETAIL);
});

describe("AbsensiPage", () => {
  it("defaults every peserta to Hadir and saves the whole kelompok at once", async () => {
    const user = userEvent.setup();
    actorRef.current.simpanAbsensi.mockResolvedValue({
      hadir: 2n,
      izin: 0n,
      sakit: 0n,
      alpa: 0n,
      total: 2n,
    });

    render(<AbsensiPage />, { wrapper });

    // Pilih sesi.
    await user.click(await screen.findByLabelText("Pilih Sesi"));
    await user.click(await screen.findByRole("option", { name: /Halaqah 1/ }));

    expect(await screen.findByText("Ahmad")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();

    // Kedua peserta default Hadir.
    const tombolHadir = screen.getAllByRole("button", { name: "Hadir" });
    expect(tombolHadir).toHaveLength(2);
    for (const tombol of tombolHadir) {
      expect(tombol).toHaveAttribute("aria-pressed", "true");
    }

    await user.click(screen.getByRole("button", { name: /simpan absensi/i }));

    await waitFor(() => {
      expect(actorRef.current.simpanAbsensi).toHaveBeenCalledTimes(1);
    });
    const input = actorRef.current.simpanAbsensi.mock.calls[0][0];
    expect(input.sesiId).toBe(7n);
    expect(input.daftar).toEqual([
      { pesertaId: 1n, status: StatusAbsensi.hadir, catatan: "" },
      { pesertaId: 2n, status: StatusAbsensi.hadir, catatan: "" },
    ]);
  });

  it("changes a status and a catatan, and the live summary follows", async () => {
    const user = userEvent.setup();
    render(<AbsensiPage />, { wrapper });

    await user.click(await screen.findByLabelText("Pilih Sesi"));
    await user.click(await screen.findByRole("option", { name: /Halaqah 1/ }));

    await screen.findByText("Ahmad");

    // Ubah peserta pertama menjadi Izin.
    const barisPertama = screen.getByText("Ahmad").closest("li");
    expect(barisPertama).not.toBeNull();
    await user.click(
      within(barisPertama as HTMLElement).getByRole("button", { name: "Izin" }),
    );

    // Isi catatan peserta pertama.
    await user.type(
      within(barisPertama as HTMLElement).getByLabelText("Catatan"),
      "sakit",
    );

    // Ringkasan: 1 Hadir, 1 Izin.
    const ringkasan = screen.getByLabelText("Ringkasan kehadiran");
    const selHadir = within(ringkasan).getByText("Hadir").closest("div");
    const selIzin = within(ringkasan).getByText("Izin").closest("div");
    expect(selHadir).toHaveTextContent("1");
    expect(selIzin).toHaveTextContent("1");
  });

  it("shows the saved statuses again when the session is reopened", async () => {
    const user = userEvent.setup();
    actorRef.current.detailSesi.mockResolvedValue({
      sesi: SESI,
      peserta: [
        {
          pesertaId: 1n,
          nama: "Ahmad",
          status: StatusAbsensi.izin,
          catatan: "sakit",
        },
        {
          pesertaId: 2n,
          nama: "Budi",
          status: StatusAbsensi.alpa,
          catatan: "",
        },
      ],
    });

    render(<AbsensiPage />, { wrapper });

    await user.click(await screen.findByLabelText("Pilih Sesi"));
    await user.click(await screen.findByRole("option", { name: /Halaqah 1/ }));

    await screen.findByText("Ahmad");
    const barisAhmad = screen.getByText("Ahmad").closest("li") as HTMLElement;
    const barisBudi = screen.getByText("Budi").closest("li") as HTMLElement;

    expect(
      within(barisAhmad).getByRole("button", { name: "Izin" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(within(barisAhmad).getByLabelText("Catatan")).toHaveValue("sakit");
    expect(
      within(barisBudi).getByRole("button", { name: "Alpa" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows the anggota check-in view instead of the attendance form", async () => {
    actorRef.current.getCallerUserRole.mockResolvedValue(roleUntuk("anggota"));
    actorRef.current.getPesertaSaya.mockResolvedValue(1n);

    render(<AbsensiPage />, { wrapper });

    expect(await screen.findByText("Check-in mandiri")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /simpan absensi/i }),
    ).not.toBeInTheDocument();
  });
});
