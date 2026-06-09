"use client";

import { useRef } from "react";
import { ConciergeChat } from "@/components/concierge";
import {
  Search,
  ShoppingBag,
  MapPin,
  User,
  Heart,
  ChevronRight,
  Calendar,
} from "lucide-react";
import Link from "next/link";

const NAV_LINKS = [
  "Eyeglasses",
  "Sunglasses",
  "Contacts",
  "Eye exams",
  "Insurance",
  "Accessories",
  "Quiz results",
];

const PRODUCTS = [
  { name: "Alston", price: "$95", color: "Violetwood" },
  { name: "Kemper", price: "$95", color: "Blue Marblewood" },
  { name: "Dex", price: "$175", color: "Marine Teal" },
  { name: "Werner", price: "$95", color: "Rose Water" },
  { name: "Matilda", price: "$95", color: "Smoky Mauve" },
  { name: "Scully", price: "$175", color: "Rose Water" },
];

const BENEFITS = [
  "20% off first contacts order",
  "Free shipping",
  "Free 30-day returns",
  "Vision insurance accepted",
];

const FOOTER_COLS = [
  {
    heading: "Shop",
    links: ["Eyeglasses", "Sunglasses", "Contacts", "Accessories", "Gift cards"],
  },
  {
    heading: "Learn",
    links: ["Eye exams", "Insurance", "Progressive lenses", "Blue-light glasses", "Our story"],
  },
  {
    heading: "Help",
    links: ["FAQ", "Shipping & returns", "Find a store", "Contact us", "Accessibility"],
  },
  {
    heading: "Company",
    links: ["About us", "Careers", "Press", "Social good", "Sustainability"],
  },
];

export default function Home() {
  const styleAdvisorOpenRef = useRef<{ open: () => void } | null>(null);

  return (
    <div
      className="min-h-screen bg-white text-[#1F1F1F]"
      style={{ fontFamily: "var(--font-dm-sans), system-ui, sans-serif" }}
    >
      {/* ── Utility bar ── */}
      <header className="w-full">
        <div className="relative h-8 bg-[#062a78] px-6 text-[11.5px] font-medium tracking-[0.02em] text-white">
          <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between">
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 opacity-90 hover:opacity-100"
            >
              <MapPin size={11} strokeWidth={1.8} />
              <span>Find a store</span>
            </Link>
            <span className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold tracking-[0.22em]">
              Lyzr eye store
            </span>
            <Link
              href="#"
              className="inline-flex items-center gap-1.5 opacity-90 hover:opacity-100"
            >
              <Calendar size={11} strokeWidth={1.8} />
              <span>Book an exam</span>
            </Link>
          </div>
        </div>

        {/* ── Primary nav ── */}
        <div className="h-[56px] border-b border-[#e8e8e8] bg-white px-6">
          <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between">
            <nav className="flex items-center gap-7">
              {NAV_LINKS.map((label) => (
                <Link
                  key={label}
                  href="#"
                  className="relative text-[13.5px] font-medium text-[#111111] after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-0 after:bg-[#111111] after:transition-[width] after:duration-200 hover:after:w-full"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-4 text-[#242424]">
              <button className="inline-flex h-[34px] items-center gap-1.5 rounded-full border border-[#d0d0d0] px-4 text-[13px] font-medium hover:border-[#aaaaaa] hover:bg-[#f7f7f7]">
                <User size={14} strokeWidth={1.8} />
                <span>Sign in</span>
              </button>
              <button className="hover:text-[#0050cb]" aria-label="Search">
                <Search size={18} strokeWidth={1.8} />
              </button>
              <button className="hover:text-[#c0392b]" aria-label="Wishlist">
                <Heart size={18} strokeWidth={1.8} />
              </button>
              <button className="hover:text-[#0050cb]" aria-label="Cart">
                <ShoppingBag size={18} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Hero ── */}
        <section
          className="relative h-[460px] overflow-hidden"
          style={{
            backgroundImage:
              "url(https://img.warbyparker.com/v2/SpringCore2_HP-P1_Desktop-3_REV-1-28ad615fd7de4f2c8958751c7f1005ae.png?originWidth=2880&originHeight=1200&quality=80&width=2048)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="mx-auto h-full max-w-[1400px] px-8">
            <div className="flex h-full max-w-[520px] flex-col justify-center pt-8">
              <h1
                className="text-[54px] leading-[1.04] tracking-[-0.015em] text-[#0d1b2e]"
                style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
              >
                New pairs, polished
                <br />
                to perfection
              </h1>
              <div className="mt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => styleAdvisorOpenRef.current?.open()}
                  className="h-[42px] rounded-full bg-[#1557d4] px-6 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1248b8] active:scale-[0.98]"
                >
                  Start with a quiz
                </button>
                <button className="h-[42px] rounded-full bg-[#0d1b2e] px-6 text-[14px] font-semibold text-white shadow-sm hover:bg-[#1a2e47] active:scale-[0.98]">
                  Shop eyeglasses
                </button>
              </div>
              <Link
                href="#"
                className="mt-5 inline-flex items-center gap-0.5 text-[14px] font-semibold text-[#1557d4] underline-offset-2 hover:underline"
              >
                <span>Shop new arrivals</span>
                <ChevronRight size={15} strokeWidth={2.2} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── Benefit bar ── */}
        <div className="h-[44px] border-b border-[#cdd8d6] bg-[#dbe7e5] px-6">
          <div className="mx-auto grid h-full max-w-[1400px] grid-cols-4 divide-x divide-[#bfd0cc] text-center">
            {BENEFITS.map((text) => (
              <div
                key={text}
                className="flex items-center justify-center text-[12.5px] font-semibold tracking-[0.01em] text-[#2b6661]"
              >
                {text}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main>
        {/* ── New Arrivals ── */}
        <section className="pt-14 pb-4">
          <div className="mx-auto mb-7 flex max-w-[1440px] items-end justify-between px-6 lg:px-12">
            <h2
              className="text-[32px] tracking-[-0.01em] text-[#0d1b2e]"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              New arrivals
            </h2>
            <Link
              href="#"
              className="hidden items-center justify-center rounded-full border border-[#0d1b2e] px-5 py-2 text-[12.5px] font-semibold text-[#0d1b2e] hover:bg-[#0d1b2e] hover:text-white sm:inline-flex"
            >
              Shop new arrivals
            </Link>
          </div>

          <div className="no-scrollbar flex snap-x gap-5 overflow-x-auto scroll-pl-6 px-6 pb-8 lg:px-12">
            {PRODUCTS.map((item, i) => (
              <div
                key={i}
                className="group min-w-[272px] cursor-pointer snap-start lg:min-w-[300px]"
              >
                {/* Image placeholder */}
                <div className="relative mb-3.5 aspect-[4/3] overflow-hidden rounded-xl bg-[#f0f0f0]">
                  <button className="absolute bottom-3 right-3 rounded-full bg-white p-2 opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:bg-gray-50">
                    <ShoppingBag size={15} className="text-[#0d1b2e]" />
                    <span className="sr-only">Quick add</span>
                  </button>
                  <div className="absolute left-3 top-3 rounded-sm bg-white px-2 py-[3px] text-[10px] font-bold uppercase tracking-wider text-[#0d1b2e] opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                    Try on
                  </div>
                </div>
                {/* Info */}
                <h3
                  className="mb-0.5 text-[18px] text-[#0d1b2e]"
                  style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
                >
                  {item.name}
                </h3>
                <p className="text-[13px] text-[#666]">{item.color}</p>
                <p className="mt-0.5 text-[13px] font-semibold text-[#1F1F1F]">{item.price}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Collections Grid ── */}
        <section className="mb-1 grid gap-1 md:grid-cols-2">
          {/* Left panel */}
          <div className="group relative flex aspect-square items-center justify-center overflow-hidden bg-[#d4e2ed] md:aspect-[4/5]">
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]"
              style={{
                background:
                  "radial-gradient(ellipse at 60% 40%, #c5d8e6 0%, #b8cedd 60%, #a8bece 100%)",
              }}
            />
            <div className="relative z-10 p-10 text-center">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#4a7a8a]">
                Collection
              </p>
              <h2
                className="mb-7 text-[40px] leading-[1.08] tracking-[-0.01em] text-[#0d1b2e] lg:text-[48px]"
                style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
              >
                Eyewear with
                <br />
                architectural allure
              </h2>
              <button className="rounded-full border border-[#0d1b2e] px-7 py-2.5 text-[13px] font-semibold text-[#0d1b2e] transition-colors hover:bg-[#0d1b2e] hover:text-white">
                Shop The New Deco
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="group relative flex aspect-square items-center justify-center overflow-hidden bg-[#edd4d4] md:aspect-[4/5]">
            <div
              className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.03]"
              style={{
                background:
                  "radial-gradient(ellipse at 40% 60%, #e6c5c5 0%, #ddb8b8 60%, #ceaaa8 100%)",
              }}
            />
            <div className="relative z-10 p-10 text-center">
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[#8a4a4a]">
                Spring 2026
              </p>
              <h2
                className="mb-7 text-[40px] leading-[1.08] tracking-[-0.01em] text-[#0d1b2e] lg:text-[48px]"
                style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
              >
                Bring spring
                <br />
                into view
              </h2>
              <button className="rounded-full border border-[#0d1b2e] px-7 py-2.5 text-[13px] font-semibold text-[#0d1b2e] transition-colors hover:bg-[#0d1b2e] hover:text-white">
                Shop Spring 2026
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="mt-16 border-t border-[#e2ddd6] bg-[#faf9f7]">
          <div className="mx-auto max-w-[1440px] px-6 py-14 lg:px-12">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {FOOTER_COLS.map((col) => (
                <div key={col.heading}>
                  <p className="mb-4 text-[11.5px] font-bold uppercase tracking-[0.14em] text-[#1F1F1F]">
                    {col.heading}
                  </p>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <Link
                          href="#"
                          className="text-[13.5px] text-[#555] hover:text-[#1F1F1F]"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e2ddd6] pt-8 text-[12px] text-[#888] sm:flex-row">
              <p>&copy; {new Date().getFullYear()} Lyzr eye store. All rights reserved.</p>
              <div className="flex gap-5">
                <Link href="#" className="hover:text-[#1F1F1F]">Privacy Policy</Link>
                <Link href="#" className="hover:text-[#1F1F1F]">Terms of Use</Link>
                <Link href="#" className="hover:text-[#1F1F1F]">Accessibility</Link>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* ── Style Advisor ── */}
      <ConciergeChat
        openRef={styleAdvisorOpenRef}
        title="Style Advisor"
        placeholder="Ask about frames, fit, prescriptions..."
        pillLabel="Style Advisor"
        pillHoverLabel="Find your perfect pair"
        initialMessage="Welcome to Lyzr eye store. I'm your personal Style Advisor — here to help you find the perfect frames. Tell me about your face shape, lifestyle, or what you're looking for."
      />
    </div>
  );
}
