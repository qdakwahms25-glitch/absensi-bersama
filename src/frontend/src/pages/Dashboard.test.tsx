import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { MediaSesi } from "@/backend";
import { DashboardPage } from "@/pages/Dashboard";
import { buatActorMock, buatIdentityMock } from "@/test/harness";

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
  ...(await routerMock)("/"),
}));

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

beforeEach(() => {
  actorRef.current = buatActorMock();
  identityRef.current = buatIdentityMock();
});

describe("DashboardPage", () => {
  it("shows this month's attendance, the nearest session and the lowest halaqah", async () => {
    actorRef.current.dashboard.mockResolvedValue({
      kehadiranBulanIni: 82.5,
      sesiTerdekat: {
        id: 7n,
        tanggal: 1_759_654_800_000_000_000n,
        kelompokId: "asatidz-h1",
        mapelId: 3n,
        pemateri: "Ustadz Ali",
        media: MediaSesi.tatapMuka,
      },
      halaqahTerendah: {
        kelompokId: "asatidz-h2",
        nama: "Halaqah 2",
        totalSesi: 4n,
        totalHadir: 2n,
        persentase: 50,
      },
    });

    render(<DashboardPage />, { wrapper });

    expect(await screen.findByText("82.5%")).toBeInTheDocument();
    expect(screen.getByText("Halaqah 1")).toBeInTheDocument();
    // "Pemateri: Ustadz Ali" is one paragraph split across text nodes, so match
    // on the element's full text content rather than a single text node.
    expect(
      screen.getByText((_, el) => el?.textContent === "Pemateri: Ustadz Ali"),
    ).toBeInTheDocument();
    expect(screen.getByText("Halaqah 2")).toBeInTheDocument();
    expect(screen.getByText("50.0%")).toBeInTheDocument();
  });

  it("shows an empty state when there is no activity", async () => {
    actorRef.current.dashboard.mockResolvedValue({ kehadiranBulanIni: 0 });

    render(<DashboardPage />, { wrapper });

    expect(await screen.findByText("Belum ada aktivitas")).toBeInTheDocument();
  });
});
