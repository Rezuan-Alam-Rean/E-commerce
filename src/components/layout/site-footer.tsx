"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "Shop Products", href: "/products" },
  { label: "Cart", href: "/cart" },
];

const supportLinks = [
  { label: "My Orders", href: "/dashboard/orders" },
  { label: "Wishlist", href: "/dashboard/wishlist" },
  { label: "Profile", href: "/dashboard/profile" },
  { label: "Account Login", href: "/login" },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export function SiteFooter() {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  if (hideFooter) {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#040711] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
              Aurelia Commerce
            </p>
            <p className="text-2xl font-serif leading-snug">
              Everyday statements shaped for Dhaka streets and beyond.
            </p>
            <p className="text-sm text-white/70">
              hello@aurelia.store · +880 1300-000000
            </p>
          </div>
          <div className="flex flex-1 flex-wrap gap-10 text-sm text-white/80">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                Quick Links
              </p>
              <nav className="mt-3 flex flex-col gap-2">
                {quickLinks.map((link) => (
                  <Link key={link.label} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                Support
              </p>
              <nav className="mt-3 flex flex-col gap-2">
                {supportLinks.map((link) => (
                  <Link key={link.label} href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/60">
                Socials
              </p>
              <div className="mt-3 flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em]">
                {socials.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="transition hover:text-white"
                  >
                    {social.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-xs text-white/60 md:flex-row md:items-center md:justify-between">
          <p>© {year} Aurelia Commerce. All rights reserved.</p>
          <p className="text-white/50">
            Privacy · Terms · Sustainability
          </p>
        </div>
      </div>
    </footer>
  );
}
