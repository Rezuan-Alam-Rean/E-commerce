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
};

export function DashboardShell({ title, items, children, requiredRole }: DashboardShellProps) {
  const [collapsed, setCollapsed] = useState(false);
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
    if (ready && !loading && !user) {
      const nextPath = pathname ?? "/dashboard";
      router.replace(`/login?reason=auth&from=${encodeURIComponent(nextPath)}`);
    }
  }, [user, loading, pathname, router, ready]);

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
  };

  return (
    <div className="min-h-screen bg-surface">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-8 md:grid-cols-[240px_1fr]">
        <aside
          className={`hidden rounded-[24px] bg-white p-5 shadow-[var(--shadow)] transition md:block ${
            collapsed ? "md:w-20" : "md:w-full"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              {collapsed ? "D" : "Dashboard"}
            </span>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-muted"
              onClick={() => setCollapsed((value) => !value)}
            >
              {collapsed ? "Expand" : "Collapse"}
            </button>
          </div>
          <nav className="mt-6 flex flex-col gap-3">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                  pathname === item.href
                    ? "border-accent bg-accent text-white"
                    : "border-border bg-surface-strong text-foreground hover:bg-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-surface-strong"
            >
              Logout
            </button>
          </nav>
        </aside>
        <div className="flex flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-white px-6 py-4 shadow-[var(--shadow)]">
            <button
              type="button"
              className="rounded-full border border-border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] md:hidden"
              onClick={() => setMobileOpen(true)}
            >
              Menu
            </button>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                {user?.role === "admin" ? "Admin" : "Account"}
              </p>
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            </div>
            {user ? (
              <div className="text-sm text-muted">{user.email}</div>
            ) : null}
          </header>
          <div className="rounded-[24px] bg-white p-6 shadow-[var(--shadow)]">
            {children}
          </div>
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
                  className="rounded-full border border-border bg-surface-strong px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-border bg-surface-strong px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
              >
                Logout
              </button>
            </nav>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
