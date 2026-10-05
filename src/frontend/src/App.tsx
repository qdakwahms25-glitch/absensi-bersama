import { Toaster } from "@/components/ui/sonner";
import { AbsensiPage } from "@/pages/Absensi";
import { DashboardPage } from "@/pages/Dashboard";
import { DataMasterPage } from "@/pages/DataMaster";
import { LoginPage } from "@/pages/Login";
import { RekapPage } from "@/pages/Rekap";
import { SesiPage } from "@/pages/Sesi";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

function RootLayout() {
  const { isAuthenticated, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div
        data-ocid="app.loading_state"
        className="flex min-h-dvh items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center gap-3">
          <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat aplikasi…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <Outlet />;
}

const rootRoute = createRootRoute({ component: RootLayout });

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const sesiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sesi",
  component: SesiPage,
});

const absensiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/absensi",
  validateSearch: (
    search: Record<string, unknown>,
  ): { sesi?: string; token?: string } => ({
    sesi: typeof search.sesi === "string" ? search.sesi : undefined,
    token: typeof search.token === "string" ? search.token : undefined,
  }),
  component: AbsensiPage,
});

const rekapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/rekap",
  component: RekapPage,
});

const dataMasterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/data-master",
  component: DataMasterPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  sesiRoute,
  absensiRoute,
  rekapRoute,
  dataMasterRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}
