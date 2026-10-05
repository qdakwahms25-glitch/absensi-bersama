import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  Database,
  LayoutDashboard,
} from "lucide-react";

interface TabItem {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  ocid: string;
}

const TABS: TabItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, ocid: "nav.dashboard" },
  { to: "/sesi", label: "Sesi", icon: CalendarDays, ocid: "nav.sesi" },
  {
    to: "/absensi",
    label: "Absensi",
    icon: ClipboardCheck,
    ocid: "nav.absensi",
  },
  { to: "/rekap", label: "Rekap", icon: BookOpen, ocid: "nav.rekap" },
  {
    to: "/data-master",
    label: "Data Master",
    icon: Database,
    ocid: "nav.data_master",
  },
];

export function AppNav() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between px-2 pb-[env(safe-area-inset-bottom)]">
        {TABS.map((tab) => {
          const aktif =
            tab.to === "/" ? pathname === "/" : pathname.startsWith(tab.to);
          const Icon = tab.icon;
          return (
            <li key={tab.to} className="flex-1">
              <Link
                to={tab.to}
                data-ocid={tab.ocid}
                aria-current={aktif ? "page" : undefined}
                className={cn(
                  "group flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[11px] font-semibold transition-smooth",
                  aktif
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-full transition-smooth",
                    aktif
                      ? "bg-primary text-primary-foreground shadow-subtle"
                      : "bg-transparent group-hover:bg-muted",
                  )}
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                </span>
                <span className="leading-none">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
