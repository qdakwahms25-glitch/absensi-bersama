import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DataMasterPage } from "@/pages/DataMaster";
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
  ...(await routerMock)("/data-master"),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

function renderPage() {
  return render(<DataMasterPage />, { wrapper });
}

beforeEach(() => {
  actorRef.current = buatActorMock();
  identityRef.current = buatIdentityMock();
});

describe("DataMasterPage", () => {
  it("shows the admin peserta list with names and kelompok", async () => {
    actorRef.current.listPeserta.mockResolvedValue([
      { id: 1n, nama: "Ahmad", kelompokId: "asatidz-h1" },
      { id: 2n, nama: "Budi", kelompokId: "musyrifah" },
    ]);

    renderPage();

    expect(await screen.findByText("Ahmad")).toBeInTheDocument();
    expect(screen.getByText("Budi")).toBeInTheDocument();
    expect(screen.getByText("Halaqah 1")).toBeInTheDocument();
    expect(screen.getByText("Musyrifah")).toBeInTheDocument();
  });

  it("adds a peserta with a name and kelompok", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /tambah peserta/i }),
    );

    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Nama"), "Citra");
    await user.click(within(dialog).getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(actorRef.current.tambahPeserta).toHaveBeenCalledWith({
        nama: "Citra",
        kelompokId: "asatidz-h1",
      });
    });
  });

  it("rejects an empty peserta name with an Indonesian validation message", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole("button", { name: /tambah peserta/i }),
    );
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Simpan" }));

    expect(
      await within(dialog).findByText("Nama peserta wajib diisi."),
    ).toBeInTheDocument();
    expect(actorRef.current.tambahPeserta).not.toHaveBeenCalled();
  });

  it("adds a mata pelajaran", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(await screen.findByRole("tab", { name: "Mapel" }));
    await user.click(
      await screen.findByRole("button", { name: /tambah mata pelajaran/i }),
    );

    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Nama"), "Tajwid");
    await user.click(within(dialog).getByRole("button", { name: "Simpan" }));

    await waitFor(() => {
      expect(actorRef.current.tambahMapel).toHaveBeenCalledWith({
        nama: "Tajwid",
      });
    });
  });

  it("saves a new ambang and shows the success message", async () => {
    const user = userEvent.setup();
    actorRef.current.getAmbang.mockResolvedValue(75);
    actorRef.current.setAmbang.mockResolvedValue(80);

    renderPage();

    await user.click(await screen.findByRole("tab", { name: "Ambang" }));
    await user.type(await screen.findByLabelText("Ambang Baru (%)"), "80");
    await user.click(screen.getByRole("button", { name: /simpan ambang/i }));

    await waitFor(() => {
      expect(actorRef.current.setAmbang).toHaveBeenCalledWith({
        persentase: 80,
      });
    });
    expect(
      await screen.findByText(/Ambang kehadiran disimpan: 80.0%/),
    ).toBeInTheDocument();
  });

  it("blocks non-admin callers from the master data", async () => {
    actorRef.current.getCallerUserRole.mockResolvedValue(roleUntuk("anggota"));

    renderPage();

    expect(await screen.findByText("Akses terbatas")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /tambah peserta/i }),
    ).not.toBeInTheDocument();
  });
});
