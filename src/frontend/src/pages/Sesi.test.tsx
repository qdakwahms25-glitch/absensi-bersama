import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MediaSesi } from "@/backend";
import { dateToTimestamp } from "@/lib/format";
import { SesiPage } from "@/pages/Sesi";
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
  ...(await routerMock)("/sesi"),
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

beforeEach(() => {
  actorRef.current = buatActorMock();
  identityRef.current = buatIdentityMock();
  actorRef.current.listMapel.mockResolvedValue([{ id: 3n, nama: "Tajwid" }]);
});

describe("SesiPage", () => {
  it("lists sessions with kelompok, mapel, pemateri and media", async () => {
    actorRef.current.listSesi.mockResolvedValue([SESI]);

    render(<SesiPage />, { wrapper });

    expect(await screen.findByText("Halaqah 1")).toBeInTheDocument();
    expect(screen.getByText("Tajwid")).toBeInTheDocument();
    expect(screen.getByText("Ustadz Ali")).toBeInTheDocument();
    expect(screen.getByText("Tatap Muka")).toBeInTheDocument();
  });

  it("creates a session with tanggal, kelompok, mapel, pemateri and media", async () => {
    const user = userEvent.setup();
    actorRef.current.listSesi.mockResolvedValue([]);
    actorRef.current.buatSesi.mockResolvedValue(SESI);

    render(<SesiPage />, { wrapper });

    await user.click(await screen.findByRole("button", { name: "Tambah" }));
    const dialog = await screen.findByRole("dialog");

    await user.type(within(dialog).getByLabelText("Pemateri"), "Ustadz Ali");
    await user.type(
      within(dialog).getByLabelText("Tanggal & Waktu"),
      "2026-10-05T09:00",
    );
    await user.type(
      within(dialog).getByLabelText("Jendela Mulai"),
      "2026-10-05T09:00",
    );
    await user.type(
      within(dialog).getByLabelText("Jendela Selesai"),
      "2026-10-05T10:00",
    );

    // Pilih mata pelajaran lewat combobox.
    await user.click(within(dialog).getByLabelText("Mata Pelajaran"));
    await user.click(await screen.findByRole("option", { name: "Tajwid" }));

    await user.click(within(dialog).getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(actorRef.current.buatSesi).toHaveBeenCalledTimes(1);
    });
    const input = actorRef.current.buatSesi.mock.calls[0][0];
    expect(input).toMatchObject({
      kelompokId: "asatidz-h1",
      mapelId: 3n,
      pemateri: "Ustadz Ali",
      media: MediaSesi.tatapMuka,
    });
    // Dihitung dengan helper yang sama seperti komponen agar tidak
    // bergantung pada zona waktu mesin uji.
    expect(input.tanggal).toBe(dateToTimestamp("2026-10-05T09:00"));
  });

  it("duplicates a session onto a chosen date", async () => {
    const user = userEvent.setup();
    actorRef.current.listSesi.mockResolvedValue([SESI]);
    actorRef.current.duplikatSesi.mockResolvedValue([{ ...SESI, id: 8n }]);

    render(<SesiPage />, { wrapper });

    await user.click(
      await screen.findByRole("button", { name: "Duplikat sesi" }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.type(
      within(dialog).getByLabelText("Tanggal tujuan 1"),
      "2026-10-12T09:00",
    );
    await user.click(within(dialog).getByRole("button", { name: "Duplikat" }));

    await waitFor(() => {
      expect(actorRef.current.duplikatSesi).toHaveBeenCalledWith({
        sesiId: 7n,
        // Dihitung dengan helper yang sama seperti komponen agar tidak
        // bergantung pada zona waktu mesin uji.
        tanggalTujuan: [dateToTimestamp("2026-10-12T09:00")],
      });
    });
  });

  it("hides admin-only actions from a ketua halaqah", async () => {
    actorRef.current.getCallerUserRole.mockResolvedValue(
      roleUntuk("ketuaHalaqah"),
    );
    actorRef.current.listSesi.mockResolvedValue([SESI]);

    render(<SesiPage />, { wrapper });

    expect(await screen.findByText("Halaqah 1")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tambah/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Duplikat sesi" }),
    ).not.toBeInTheDocument();
  });
});
