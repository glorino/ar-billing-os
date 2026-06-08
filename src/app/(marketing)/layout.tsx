"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Wallet, Menu, X } from "lucide-react"

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Solutions", href: "/solutions" },
  { label: "About", href: "/about" },
]

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Solutions", href: "/solutions" },
      { label: "Integrations", href: "/features" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/about" },
      { label: "Blog", href: "/about" },
      { label: "Press", href: "/about" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/features" },
      { label: "Help Center", href: "/contact" },
      { label: "API Reference", href: "/features" },
      { label: "Status", href: "/features" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/about" },
      { label: "Terms of Service", href: "/about" },
      { label: "Cookie Policy", href: "/about" },
      { label: "GDPR", href: "/about" },
    ],
  },
]

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-card/95 backdrop-blur-xl border-b border-border shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Wallet className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold">AR Billing</span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/sign-in"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="inline-flex h-9 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-card/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border space-y-3">
                <Link
                  href="/sign-in"
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="block text-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 pt-16">{children}</main>

      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h3 className="text-sm font-semibold mb-4">{col.title}</h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            &copy; 2024 AR Billing OS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
