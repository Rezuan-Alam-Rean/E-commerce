"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/features/cart/cart.store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";

export type DashboardNavItem = {
  label: string;
  href: string;
};

type DashboardShellProps = {
  title: string;
  items: DashboardNavItem[];
  children: ReactNode;
  requiredRole?: "user" | "admin";
  allowAnonymous?: boolean;
};

export function DashboardShell({ title, items, children, requiredRole, allowAnonymous }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading, logout, load } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const { reset: resetCart } = useCartStore();
  const { reset: resetWishlist } = useWishlistStore();

  useEffect(() => {
    let active = true;
    load().finally(() => {
      if (active) {
        setReady(true);
      }
    });
    return () => {
      active = false;
    };
  }, [load]);

  useEffect(() => {
    if (!ready || loading || user) {
      return;
    }
    if (allowAnonymous) {
      return;
    }
    const nextPath = pathname ?? "/dashboard";
    router.replace(`/login?reason=auth&from=${encodeURIComponent(nextPath)}`);
  }, [user, loading, pathname, router, ready, allowAnonymous]);

  useEffect(() => {
    if (!ready || loading || !user || !requiredRole) {
      return;
    }
    if (requiredRole === "admin" && user.role !== "admin") {
      router.replace("/dashboard");
    }
    if (requiredRole === "user" && user.role !== "user") {
      router.replace("/admin");
    }
  }, [ready, loading, user, requiredRole, router]);

  const handleLogout = async () => {
    await logout();
    resetCart();
    resetWishlist();
    router.replace("/login");
  };

  const resolvedRoleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "user"
        ? "Customer"
        : allowAnonymous
          ? "Guest"
          : requiredRole === "admin"
            ? "Administrator"
            : requiredRole === "user"
              ? "Customer"
              : "Account";

  const guestActions = allowAnonymous ? (
    <div className="flex flex-col gap-2 text-left">
      <Link
        href="/login"
        className="rounded-2xl border border-border bg-white/80 px-3 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-[1px] hover:bg-white"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="rounded-2xl border border-dashed border-border/70 px-3 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-[1px] hover:bg-white/70"
      >
        Register
      </Link>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3f5fb] via-white to-[#f3f5fb] md:pl-[18rem]">
      <aside className="hidden md:block">
        <div className="fixed left-6 top-6 flex h-[calc(100vh-3rem)] w-60 flex-col justify-between rounded-3xl border border-border/70 bg-white/90 px-4 py-5 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
          <div className="space-y-6">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
                Dashboard
              </span>
              <p className="mt-1 text-sm text-foreground/80">
                {resolvedRoleLabel}
              </p>
            </div>
            <nav className="flex flex-col gap-2">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-2xl border px-3 py-2 text-sm font-semibold transition ${
                    pathname === item.href
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-transparent bg-surface-strong text-foreground hover:border-border"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-2xl border border-border bg-white/80 px-3 py-2 text-sm font-semibold text-foreground transition hover:-translate-y-[1px] hover:bg-white"
            >
              Logout
            </button>
          ) : (
            guestActions
          )}
        </div>
      </aside>
      <div className="px-4 py-6 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 pb-10">
          <header className="rounded-3xl border border-border/60 bg-white/90 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="rounded-2xl border border-border px-3 py-2 text-sm font-semibold md:hidden"
                onClick={() => setMobileOpen(true)}
              >
                Menu
              </button>
              <div className="flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
                  {resolvedRoleLabel === "Administrator" ? "Admin Console" : "Account Center"}
                </p>
                <div className="mt-1 flex flex-wrap items-baseline gap-3">
                  <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
                  {user ? <span className="text-sm text-muted">{user.email}</span> : null}
                </div>
              </div>
              {user ? (
                <div className="flex gap-2 text-xs text-muted">
                  <span className="rounded-full bg-surface px-3 py-1">
                    Active
                  </span>
                  <span className="rounded-full bg-surface px-3 py-1">
                    {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              ) : allowAnonymous ? (
                <div className="flex gap-2 text-xs text-muted">
                  <span className="rounded-full bg-surface px-3 py-1">
                    Guest Mode
                  </span>
                  <Link
                    href="/login"
                    className="rounded-full border border-border px-3 py-1 font-semibold text-foreground"
                  >
                    Login
                  </Link>
                </div>
              ) : null}
            </div>
          </header>
          <section className="rounded-3xl border border-border/60 bg-white/95 p-6 shadow-[0_25px_65px_rgba(15,23,42,0.08)]">
            <div className="space-y-6">
              {children}
            </div>
          </section>
        </div>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 bg-black/30 md:hidden" onClick={() => setMobileOpen(false)}>
          <aside
            className="absolute left-0 top-0 h-full w-72 bg-white p-6 shadow-[var(--shadow)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Menu
              </span>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                onClick={() => setMobileOpen(false)}
              >
                Close
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-3">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-semibold"
                >
                  Logout
                </button>
              ) : allowAnonymous ? (
                <>
                  <Link
                    href="/login"
                    className="rounded-2xl border border-dashed border-border bg-surface-strong px-4 py-2 text-sm font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-2xl border border-border bg-surface-strong px-4 py-2 text-sm font-semibold"
                    onClick={() => setMobileOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : null}
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
