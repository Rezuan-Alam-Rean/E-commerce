"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/features/cart/cart.store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, load, logout } = useAuth();
  const { cart, load: loadCart, reset: resetCart } = useCartStore();
  const { wishlist, load: loadWishlist, reset: resetWishlist } = useWishlistStore();
  const handleLogout = async () => {
    await logout();
    resetCart();
    resetWishlist();
  };

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (user?.role === "user") {
      loadCart();
      loadWishlist();
    }
  }, [user, loadCart, loadWishlist]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[rgba(247,244,239,0.9)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <Link href="/" className="text-lg font-semibold tracking-[0.4em]">
            AURELIA
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition hover:text-foreground">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] md:hidden"
            onClick={() => setOpen(true)}
          >
            <span className="text-xs">Menu</span>
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </span>
          </button>
          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <>
                <Link href="/login" className="text-xs font-semibold uppercase tracking-[0.2em]">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-surface-strong"
                >
                  Register
                </Link>
              </>
            ) : user.role === "admin" ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-full border border-border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-foreground transition hover:bg-surface-strong"
                >
                  Admin Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Dashboard
                </Link>
                <Link
                  href="/cart"
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Cart ({cart?.items.length ?? 0})
                </Link>
                <Link
                  href="/dashboard/wishlist"
                  className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Wishlist ({wishlist?.products.length ?? 0})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-xs font-semibold uppercase tracking-[0.2em]"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-[60] bg-black/40 md:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-80 bg-white p-6 shadow-[var(--shadow)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Menu
              </span>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em]"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <nav className="mt-6 flex flex-col gap-3 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2 text-muted transition hover:text-foreground"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : user.role === "admin" ? (
                <>
                  <Link
                    href="/admin"
                    className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <button
                    type="button"
                    className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2 text-left"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/cart"
                    className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Cart ({cart?.items.length ?? 0})
                  </Link>
                  <Link
                    href="/dashboard/wishlist"
                    className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2"
                    onClick={() => setOpen(false)}
                  >
                    Wishlist ({wishlist?.products.length ?? 0})
                  </Link>
                  <button
                    type="button"
                    className="rounded-[var(--radius-md)] bg-surface-strong px-4 py-2 text-left"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
