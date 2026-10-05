import { AppNav } from "@/components/AppNav";
import type { ReactNode } from "react";

interface LayoutProps {
  judul: string;
  subjudul?: string;
  aksi?: ReactNode;
  children: ReactNode;
}

export function Layout({ judul, subjudul, aksi, children }: LayoutProps) {
  const tahun = new Date().getFullYear();

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="bg-gradient-primary rounded-b-2xl px-4 pb-6 pt-7 text-primary-foreground shadow-elevated">
        <div className="mx-auto flex max-w-2xl items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/70">
              Absensi Belajar Bersama
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
              {judul}
            </h1>
            <span
              aria-hidden="true"
              className="mt-2 block h-0.5 w-12 rounded-full bg-gradient-gold animate-gold-sweep"
            />
            {subjudul ? (
              <p className="mt-2 text-sm text-primary-foreground/80">
                {subjudul}
              </p>
            ) : null}
          </div>
          {aksi ? <div className="shrink-0">{aksi}</div> : null}
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28 pt-5">
        {children}
      </main>

      <footer className="border-t border-border bg-card px-4 py-4 pb-24 text-center">
        <p className="text-xs text-muted-foreground">
          © {tahun}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              window.location.hostname,
            )}`}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>

      <AppNav />
    </div>
  );
}
