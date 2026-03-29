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

// SVG Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, load, logout } = useAuth();
  const { cart, load: loadCart, reset: resetCart } = useCartStore();
  const { wishlist, load: loadWishlist, reset: resetWishlist } = useWishlistStore();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadCart();
    loadWishlist();
  }, [user, loadCart, loadWishlist]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const handleLogout = async () => {
    await logout();
    resetCart();
    resetWishlist();
    setOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const cartCount = cart?.items.length ?? 0;
  const wishlistCount = wishlist?.products.length ?? 0;

  return (
    <>
      <header
        className={`fixed top-0 w-full z-[80] transition-all duration-300 ${
          scrolled
            ? "bg-white/80 backdrop-blur-2xl border-b border-gray-200/50 shadow-sm py-4"
            : "bg-white/50 backdrop-blur-md border-b-transparent py-5 lg:py-6"
        }`}
      >
        <div className="container mx-auto px-6 max-w-7xl flex items-center justify-between">
          
          {/* Left: Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 -ml-2 text-gray-700 hover:text-black transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Toggle menu"
            >
              <MenuIcon />
            </button>
            <Link
              href="/"
              className="group flex flex-col items-start justify-center transition-transform active:scale-95"
            >
              <span className="text-2xl font-bold tracking-widest text-[#0d111f] font-english uppercase">
                DigitalHaat
              </span>
              <span className="hidden md:block text-[9px] font-semibold tracking-[0.4em] text-gray-500 uppercase mt-0.5 group-hover:text-amber-600 transition-colors">
                ফ্যাশন ফর দ্য ফ্যামিলি
              </span>
            </Link>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative group py-2"
                >
                  <span
                    className={`text-sm font-medium tracking-wide uppercase transition-colors duration-200 font-english ${
                      active ? "text-amber-600" : "text-gray-600 group-hover:text-black"
                    }`}
                  >
                    {link.label}
                  </span>
                  {/* Animated Underline */}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-amber-600 transition-all duration-300 ease-out ${
                      active ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-4 md:gap-5">
            {/* Wishlist */}
            <Link
              href="/dashboard/wishlist"
              className="relative p-2 text-gray-600 hover:text-rose-500 transition-colors active:scale-90"
              aria-label="Wishlist"
            >
              <HeartIcon />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="relative p-2 text-gray-600 hover:text-amber-600 transition-colors active:scale-90"
              aria-label="Cart"
            >
              <ShoppingBagIcon />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>

            {/* User Account */}
            {!user ? (
              <div className="hidden sm:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold tracking-wide text-gray-600 hover:text-black uppercase font-english transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold tracking-wide bg-[#0d111f] text-white px-5 py-2.5 rounded-full uppercase font-english hover:bg-black hover:shadow-lg hover:shadow-black/20 transition-all active:scale-95"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4">
                <Link
                  href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                >
                  <UserIcon />
                  <span className="font-english uppercase tracking-wide">
                    {user.role === "admin" ? "Admin" : "Account"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Logout"
                  title="Logout"
                >
                  <LogOutIcon />
                </button>
              </div>
            )}
            
            {/* Mobile User Icon (Visible only on very small screens if needed, but handled by menu mostly) */}
            <div className="sm:hidden ml-1">
               <Link
                  href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"}
                  className="p-2 text-gray-600 hover:text-black transition-colors block"
               >
                 <UserIcon />
               </Link>
            </div>
          </div>
        </div>
      </header>

      {/* spacer to prevent content from going under fixed header */}
      <div className="h-20 lg:h-24" />

      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setOpen(false)}
      />

      {/* Mobile Drawer Content */}
      <div
        className={`fixed top-0 left-0 bottom-0 z-[100] w-[300px] max-w-[85vw] bg-white border-r border-gray-100 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] lg:hidden flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
           <span className="text-xl font-bold tracking-widest text-[#0d111f] font-english uppercase">
              DigitalHaat
            </span>
          <button
            onClick={() => setOpen(false)}
            className="p-2 -mr-2 text-gray-400 hover:text-black transition-colors rounded-full hover:bg-gray-100"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <nav className="flex flex-col gap-6">
            <div className="space-y-4">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 font-english">
                Navigation
              </p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`block text-lg font-medium tracking-wide uppercase font-english transition-colors ${
                    isActive(link.href) ? "text-amber-600" : "text-gray-800 hover:text-amber-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="h-px bg-gray-100 w-full my-2"></div>

            <div className="space-y-4">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 font-english">
                Account
              </p>
              {!user ? (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-gray-800 uppercase tracking-wide font-english"
                  >
                    <UserIcon /> Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 mt-4 w-full bg-[#0d111f] text-white px-5 py-3.5 rounded-xl uppercase tracking-widest font-english justify-center hover:bg-black transition-colors"
                  >
                    Register Account
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={user.role === "admin" ? "/admin" : "/dashboard"}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 text-lg font-medium text-gray-800 uppercase tracking-wide font-english"
                  >
                    <UserIcon /> {user.role === "admin" ? "Admin Dash" : "My Account"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-lg font-medium text-red-500 uppercase tracking-wide font-english mt-2 w-full text-left"
                  >
                    <LogOutIcon /> Logout
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
             <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase font-english">
                Fashion for Family
             </span>
        </div>
      </div>
    </>
  );
}
