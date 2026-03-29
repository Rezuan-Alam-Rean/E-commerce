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

// Common Icons
const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const LogOutIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-100 transition-opacity -ml-2 group-hover:ml-0">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

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

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

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
    <div className="flex flex-col gap-3 mt-6">
      <Link
        href="/login"
        className="flex justify-center items-center py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all font-english"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="flex justify-center items-center py-2.5 bg-[#0d111f] rounded-xl text-sm font-semibold text-white hover:bg-black transition-all shadow-md hover:shadow-lg font-english"
      >
        Create Account
      </Link>
    </div>
  ) : null;

  return (
    <div className="min-h-screen bg-[#fafbfc] md:pl-[19rem] pt-24 md:pt-10">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block">
        <div className="fixed left-6 top-[120px] flex h-[calc(100vh-144px)] w-64 flex-col justify-between rounded-[2rem] border border-gray-200/60 bg-white/80 backdrop-blur-3xl px-5 py-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] z-40">
          <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="mb-10 pl-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-english">
                Dashboard
              </span>
              <p className="mt-1 text-base font-semibold text-gray-900 font-english truncate" title={resolvedRoleLabel}>
                {resolvedRoleLabel}
              </p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 flex-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 font-english ${isActive
                      ? "bg-[#0d111f] text-white shadow-md shadow-black/10"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRightIcon />
                  </Link>
                );
              })}
            </nav>

            {/* Sidebar Footer */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              {user ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors font-english"
                >
                  <LogOutIcon />
                  Logout
                </button>
              ) : (
                guestActions
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="px-3 py-4 sm:px-6 sm:py-6 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col gap-5 lg:gap-8 pb-10">

          {/* Top Header Section - Sticky on Mobile */}
          <header className="sticky top-4 md:static z-10 flex flex-col md:row md:items-end justify-between gap-4 bg-white/70 backdrop-blur-2xl border border-gray-200/50 rounded-[2rem] p-5 sm:p-6 lg:px-8 lg:py-6 shadow-[0_8px_32px_rgb(0,0,0,0.04)]">
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Mobile Menu Toggle */}
              <button
                type="button"
                className="mt-0.5 sm:mt-1 flex-shrink-0 rounded-xl bg-white border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 focus:outline-none md:hidden shadow-sm active:scale-95 transition-all"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <MenuIcon />
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 font-english truncate">
                    {resolvedRoleLabel === "Administrator" ? "Admin Console" : "Account Center"}
                  </p>
                  {user ? (
                    <span className="hidden xs:inline-block rounded-full bg-emerald-100/50 text-emerald-700 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider font-english">
                      Active
                    </span>
                  ) : null}
                </div>

                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight font-english truncate">
                  {title}
                </h1>

                {user && (
                  <p className="mt-0.5 text-xs text-gray-500 font-english truncate">
                    <span className="hidden sm:inline">Signed in as </span>
                    <span className="font-bold text-gray-700">{user.email}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Right side actions / date - Hidden on small mobile */}
            <div className="hidden sm:flex self-end md:self-auto items-center gap-3">
              <div className="flex items-center gap-2 bg-gray-100/80 rounded-full px-4 py-2 border border-gray-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-gray-600 font-english uppercase tracking-wider">
                  {new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <section className="bg-white rounded-[2.5rem] border border-gray-100 p-4 sm:p-7 md:p-8 shadow-[0_4px_24px_rgb(0,0,0,0.02)]">
            {children}
          </section>
        </div>
      </main>

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${mobileOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile Drawer Content */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-[100] w-[300px] max-w-[85vw] bg-white border-r border-gray-100 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] md:hidden flex flex-col ${mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 font-english">
              Dashboard
            </span>
            <p className="text-sm font-semibold text-gray-900 font-english">
              {resolvedRoleLabel}
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <nav className="flex flex-col gap-3">
            {items.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-3.5 text-sm font-semibold transition-all duration-200 font-english ${isActive
                    ? "bg-[#0d111f] text-white shadow-md shadow-black/10"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100">
          {user ? (
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-gray-200 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors shadow-sm font-english"
            >
              <LogOutIcon />
              Logout
            </button>
          ) : allowAnonymous ? (
            guestActions
          ) : null}
        </div>
      </div>
    </div>
  );
}
