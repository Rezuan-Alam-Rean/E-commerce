"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "All Products", href: "/products" },
  { label: "Cart", href: "/cart" },
  { label: "Wishlist", href: "/dashboard/wishlist" },
];

const supportLinks = [
  { label: "My Orders", href: "/dashboard/orders" },
  { label: "Profile Settings", href: "/dashboard/profile" },
  { label: "Track Delivery", href: "/dashboard/orders" },
  { label: "Support Center", href: "#" },
];

const socials = [
  { label: "Instagram", href: "https://instagram.com", icon: "IG" },
  { label: "Facebook", href: "https://facebook.com", icon: "FB" },
  { label: "Twitter", href: "https://twitter.com", icon: "TW" },
];

export function SiteFooter() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const hideFooter = pathname?.startsWith("/admin") || pathname?.startsWith("/dashboard");

  if (hideFooter) return null;

  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#050811] text-white overflow-hidden pt-16 sm:pt-20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Top Section: Branding & Newsletter */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center pb-16 border-b border-white/5">
          <div className="max-w-xl">
            <Link href="/" className="inline-block text-xl font-black tracking-[0.3em] font-english mb-6">
              DigitalHaat
            </Link>
            <h2 className="text-2xl sm:text-3xl font-black leading-tight mb-5">
              পুরো পরিবারের ক্যাজুয়াল থেকে উৎসবের পোশাক এক জায়গায়।
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              আমরা সেরা মানের ফেব্রিক এবং আধুনিক ডিজাইনের মাধ্যমে আপনার স্টাইলকে এক নতুন উচ্চতায় নিয়ে যাই। আজই আপনার সংগ্রহ শুরু করুন।
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-[32px] border border-white/5 p-8 sm:p-10">
            <h3 className="text-lg font-black font-english mb-2">Join the Newsletter</h3>
            <p className="text-xs text-gray-400 font-medium mb-6">Get weekly updates on new arrivals and exclusive festive drops.</p>
            <form
              onSubmit={(e) => { e.preventDefault(); alert("Subscribed!"); setEmail(""); }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 rounded-2xl bg-white/10 border border-white/10 px-5 py-3.5 text-sm font-english focus:outline-none focus:ring-2 focus:ring-white/10 transition-all font-medium"
              />
              <button
                type="submit"
                className="bg-white text-black hover:bg-emerald-400 hover:text-white px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all font-english"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Middle Section: Links Grid */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-4 gap-12 sm:gap-8">
          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 font-english mb-6">Explore</h4>
            <nav className="flex flex-col gap-4">
              {quickLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors font-english font-medium">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Support */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 font-english mb-6">Customer Care</h4>
            <nav className="flex flex-col gap-4">
              {supportLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-gray-400 hover:text-emerald-400 transition-colors font-english font-medium">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Presence */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 font-english mb-6">Follow Us</h4>
            <div className="flex flex-col gap-4">
              {socials.map((social) => (
                <a key={social.label} href={social.href} target="_blank" rel="noreferrer" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors font-english font-medium flex items-center gap-2">
                  <span className="w-6 text-[10px] font-black text-white/20">{social.icon}</span>
                  {social.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 font-english mb-6">Get in Touch</h4>
            <div className="space-y-4">
              <p className="text-sm text-gray-400 font-medium font-english">hello@digitalhaat.com</p>
              <p className="text-sm text-gray-400 font-medium font-english">01754886959</p>
              <p className="text-xs text-gray-500 leading-relaxed font-medium">
                ঢাকা, বাংলাদেশ। স্টাইল কেয়ার প্রতিদিন সকাল ১০:০০ টা থেকে রাত ১০:০০ টা পর্যন্ত।
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest font-english">
            © {year} DigitalHaat. Built for the modern family.
          </p>
          <div className="flex gap-8">
            <Link href="#" className="text-[10px] font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-[0.2em] font-english">Privacy</Link>
            <Link href="#" className="text-[10px] font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-[0.2em] font-english">Terms</Link>
            <Link href="#" className="text-[10px] font-bold text-gray-600 hover:text-white transition-colors uppercase tracking-[0.2em] font-english">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
