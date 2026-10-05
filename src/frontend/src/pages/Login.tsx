import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogIn, ShieldCheck } from "lucide-react";

export function LoginPage() {
  const { login, isLoggingIn, isLoginError, loginError } =
    useInternetIdentity();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-primary px-6 py-10 text-primary-foreground">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <ShieldCheck className="size-8" aria-hidden="true" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">
            Absensi Belajar Bersama
          </h1>
          <span
            aria-hidden="true"
            className="mt-3 block h-0.5 w-16 rounded-full bg-gradient-gold animate-gold-sweep"
          />
          <p className="mt-4 text-sm text-primary-foreground/80">
            Masuk untuk mencatat dan memantau kehadiran halaqah. Gunakan akun
            yang terdaftar sebagai pengurus atau anggota.
          </p>
        </div>

        <div className="mt-8 rounded-2xl bg-card p-5 text-card-foreground shadow-elevated">
          <Button
            type="button"
            size="lg"
            className="w-full rounded-lg"
            onClick={() => login()}
            disabled={isLoggingIn}
            data-ocid="login_button"
          >
            <LogIn className="size-4" aria-hidden="true" />
            {isLoggingIn ? "Menghubungkan…" : "Masuk dengan Internet Identity"}
          </Button>

          {isLoginError ? (
            <p
              data-ocid="login_error"
              className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {loginError?.message ?? "Gagal masuk. Silakan coba lagi."}
            </p>
          ) : null}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Pemanggil pertama yang masuk menjadi admin. Hubungi admin bila peran
            Anda belum sesuai.
          </p>
        </div>
      </div>
    </div>
  );
}
