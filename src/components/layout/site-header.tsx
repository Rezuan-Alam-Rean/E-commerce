"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useCartStore } from "@/features/cart/cart.store";
import { useWishlistStore } from "@/features/wishlist/wishlist.store";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, load, logout } = useAuth();
  const { cart, load: loadCart, reset: resetCart } = useCartStore();
  const { wishlist, load: loadWishlist, reset: resetWishlist } = useWishlistStore();
  const pathname = usePathname();
  const handleLogout = async () => {
    await logout();
    resetCart();
    resetWishlist();
  };
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };
  const desktopNavClass = (href: string) => {
    const active = isActive(href);
    const base = "inline-flex min-w-[120px] items-center justify-center rounded-full px-5 py-2 text-[11px] font-semibold uppercase leading-[1.2] tracking-[0.18em] transition font-english";
    return active
      ? `${base} bg-gradient-to-r from-[#0d111f] via-[#080a12] to-[#05060b] ring-1 ring-white/40 shadow-[0_15px_35px_rgba(5,6,11,0.35)]`
      : `${base} border border-border/70 bg-white/40 text-foreground/70 hover:border-foreground/30 hover:text-foreground`;
  };
  const desktopNavLabelClass = (href: string) => {
    const active = isActive(href);
    return active ? "text-white" : "text-foreground/70";
  };
  const drawerItemClass = (href?: string) => {
    const base = "rounded-2xl border px-5 py-3 text-sm font-semibold uppercase tracking-[0.2em] shadow-[0_8px_24px_rgba(1,37,24,0.08)] transition font-english";
    if (href && isActive(href)) {
      return `${base} border-foreground bg-foreground text-white`;
    }
    return `${base} border-white/60 bg-white text-foreground hover:-translate-y-0.5`;
  };

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCart();
    loadWishlist();
  }, [user, loadCart, loadWishlist]);

  const cartCount = cart?.items.length ?? 0;
  const wishlistCount = wishlist?.products.length ?? 0;

  return (
    <header className="sticky top-0 z-[80] border-b border-white/60 bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(15,23,42,0.1)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-3 lg:py-4">
        <div className="flex flex-1 items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-lg font-semibold tracking-[0.2em]">
            স্বাদবাজার
          </Link>
          <span className="hidden text-[11px] font-semibold uppercase tracking-[0.5em] text-muted lg:inline-flex">
            দেশজ স্বাদের ডেলিভারি
          </span>
          <nav className="hidden flex-1 items-center gap-3 md:flex">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={desktopNavClass(link.href)}
                  aria-current={active ? "page" : undefined}
                >
                  <span className={desktopNavLabelClass(link.href)}>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={open}
            className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-white/90 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground shadow-[0_10px_25px_rgba(15,23,42,0.08)] md:hidden font-english"
            onClick={() => setOpen(true)}
          >
            <span>Menu</span>
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </span>
          </button>
          <div className="hidden items-center gap-2 md:flex">
            {!user ? (
              <>
                <Link
                  href="/cart"
                  className="rounded-full border border-border/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground transition hover:-translate-y-0.5 font-english"
                >
                  Cart ({cartCount})
                </Link>
                <Link
                  href="/dashboard/wishlist"
                  className="rounded-full border border-border/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground transition hover:-translate-y-0.5 font-english"
                >
                  Wishlist ({wishlistCount})
                </Link>
                <Link href="/login" className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted transition hover:text-foreground font-english">
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-foreground px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white shadow-[0_18px_35px_rgba(15,23,42,0.25)] transition hover:-translate-y-0.5 font-english"
                >
                  Register
                </Link>
              </>
            ) : user.role === "admin" ? (
              <>
                <Link
                  href="/admin"
                  className="rounded-full border border-border/70 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground transition hover:-translate-y-0.5 font-english"
                >
                  Admin Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted transition hover:text-foreground font-english"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted transition hover:text-foreground font-english"
                >
                  Dashboard
                </Link>
                <Link
                  href="/cart"
                  className="rounded-full border border-border/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground transition hover:-translate-y-0.5 font-english"
                >
                  Cart ({cartCount})
                </Link>
                <Link
                  href="/dashboard/wishlist"
                  className="rounded-full border border-border/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-foreground transition hover:-translate-y-0.5 font-english"
                >
                  Wishlist ({wishlistCount})
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted transition hover:text-foreground font-english"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      {open ? (
        <div className="fixed inset-0 z-[95] bg-[#021b11]/70 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)}>
          <div
            className="absolute right-0 top-0 flex h-full w-80 flex-col bg-gradient-to-b from-[#fff7eb] via-white to-[#ecf2ee] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted font-english">
                Menu
              </span>
              <button
                type="button"
                className="text-xs font-semibold uppercase tracking-[0.2em] font-english"
                onClick={() => setOpen(false)}
              >
                Close
              </button>
            </div>
            <nav className="mt-6 rounded-[32px] border border-white/50 bg-white/85 p-4 shadow-[0_25px_50px_rgba(1,37,24,0.12)]">
              <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={drawerItemClass(link.href)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {!user ? (
                <>
                  <Link
                    href="/cart"
                    className={drawerItemClass("/cart")}
                    onClick={() => setOpen(false)}
                  >
                    Cart ({cartCount})
                  </Link>
                  <Link
                    href="/dashboard/wishlist"
                    className={drawerItemClass("/dashboard/wishlist")}
                    onClick={() => setOpen(false)}
                  >
                    Wishlist ({wishlistCount})
                  </Link>
                  <Link
                    href="/login"
                    className={drawerItemClass()}
                    onClick={() => setOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className={drawerItemClass()}
                    onClick={() => setOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : user.role === "admin" ? (
                <>
                  <Link
                    href="/admin"
                    className={drawerItemClass("/admin")}
                    onClick={() => setOpen(false)}
                  >
                    Admin Dashboard
                  </Link>
                  <button
                    type="button"
                    className={drawerItemClass()}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/dashboard"
                    className={drawerItemClass("/dashboard")}
                    onClick={() => setOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/cart"
                    className={drawerItemClass("/cart")}
                    onClick={() => setOpen(false)}
                  >
                    Cart ({cart?.items.length ?? 0})
                  </Link>
                  <Link
                    href="/dashboard/wishlist"
                    className={drawerItemClass("/dashboard/wishlist")}
                    onClick={() => setOpen(false)}
                  >
                    Wishlist ({wishlist?.products.length ?? 0})
                  </Link>
                  <button
                    type="button"
                    className={drawerItemClass()}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </>
              )}
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
