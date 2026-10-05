import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RekapPage } from "@/pages/Rekap";
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
  ...(await routerMock)("/rekap"),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const REKAP_PESERTA = [
  {
    pesertaId: 1n,
    nama: "Ahmad",
    kelompokId: "asatidz-h1",
    totalSesi: 4n,
    hadir: 4n,
    persentase: 100,
    diBawahAmbang: false,
  },
  {
    pesertaId: 2n,
    nama: "Budi",
    kelompokId: "asatidz-h1",
    totalSesi: 4n,
    hadir: 2n,
    persentase: 50,
    diBawahAmbang: true,
  },
];

beforeEach(() => {
  actorRef.current = buatActorMock();
  identityRef.current = buatIdentityMock();
  actorRef.current.rekapPerPeserta.mockResolvedValue(REKAP_PESERTA);
  actorRef.current.rekapPerKelompok.mockResolvedValue([
    {
      kelompokId: "asatidz-h1",
      nama: "Halaqah 1",
      totalSesi: 4n,
      totalHadir: 6n,
      persentase: 75,
    },
  ]);
});

describe("RekapPage", () => {
  it("shows per-peserta percentages and marks those below the ambang", async () => {
    render(<RekapPage />, { wrapper });

    expect(await screen.findByText("Ahmad")).toBeInTheDocument();
    expect(screen.getByText("100.0%")).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();

    // Penanda hanya muncul pada baris peserta yang di bawah ambang.
    const barisBudi = screen.getByText("Budi").closest("li") as HTMLElement;
    expect(within(barisBudi).getByText("Di bawah ambang")).toBeInTheDocument();
  });

  it("shows the per-kelompok tab for an admin", async () => {
    const user = userEvent.setup();
    render(<RekapPage />, { wrapper });

    await user.click(await screen.findByRole("tab", { name: "Per Kelompok" }));

    const barisKelompok = (await screen.findByText("Halaqah 1")).closest(
      "li",
    ) as HTMLElement;
    expect(within(barisKelompok).getByText("75.0%")).toBeInTheDocument();
  });

  it("changes the ambang and calls setAmbang with the new value", async () => {
    const user = userEvent.setup();
    actorRef.current.getAmbang.mockResolvedValue(75);
    actorRef.current.setAmbang.mockResolvedValue(80);

    render(<RekapPage />, { wrapper });

    await user.click(await screen.findByRole("button", { name: "Ubah" }));
    const input = await screen.findByLabelText("Ambang (%)");
    await user.clear(input);
    await user.type(input, "80");
    await user.click(screen.getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(actorRef.current.setAmbang).toHaveBeenCalledWith({
        persentase: 80,
      });
    });
  });

  it("exports the rekap as PDF and Excel", async () => {
    const user = userEvent.setup();
    render(<RekapPage />, { wrapper });

    await screen.findByText("Ahmad");

    await user.click(screen.getByRole("button", { name: "PDF" }));
    await waitFor(() => {
      expect(actorRef.current.eksporRekapPdf).toHaveBeenCalledTimes(1);
    });

    await user.click(screen.getByRole("button", { name: "Excel" }));
    await waitFor(() => {
      expect(actorRef.current.eksporRekapExcel).toHaveBeenCalledTimes(1);
    });
  });

  it("restricts an anggota to their own rekap and hides admin controls", async () => {
    actorRef.current.getCallerUserRole.mockResolvedValue(roleUntuk("anggota"));

    render(<RekapPage />, { wrapper });

    expect(
      await screen.findByText("Anda melihat rekap kehadiran Anda sendiri."),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("tab", { name: "Per Kelompok" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "PDF" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Excel" }),
    ).not.toBeInTheDocument();
  });
});
