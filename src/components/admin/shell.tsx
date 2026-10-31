"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { Icon } from "@/components/icons";
import { logout } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const NAV: Array<{ group: string; items: Array<{ href: string; label: string; icon: string; badge?: "unread" }> }> = [
  { group: "", items: [{ href: "/admin", label: "Overview", icon: "grid" }] },
  {
    group: "Site content",
    items: [
      { href: "/admin/settings", label: "Settings & Hero", icon: "spark" },
      { href: "/admin/sections", label: "Page sections", icon: "list" },
      { href: "/admin/projects", label: "Projects", icon: "film" },
      { href: "/admin/categories", label: "Categories", icon: "folder" },
      { href: "/admin/gallery", label: "Gallery", icon: "grid" },
      { href: "/admin/services", label: "Services", icon: "megaphone" },
      { href: "/admin/pricing", label: "Pricing", icon: "star" },
      { href: "/admin/testimonials", label: "Testimonials", icon: "quote" },
      { href: "/admin/painpoints", label: "Problems & solutions", icon: "check" },
      { href: "/admin/process", label: "Process", icon: "refresh" },
      { href: "/admin/stats", label: "Stats", icon: "rocket" },
      { href: "/admin/logos", label: "Client logos", icon: "globe" },
      { href: "/admin/faqs", label: "FAQs", icon: "list" },
      { href: "/admin/socials", label: "Social links", icon: "instagram" },
    ],
  },
  { group: "Growth", items: [{ href: "/admin/seo", label: "SEO & tracking", icon: "globe" }] },
  {
    group: "Inbox",
    items: [
      { href: "/admin/messages", label: "Messages", icon: "mail", badge: "unread" },
      { href: "/admin/subscribers", label: "Subscribers", icon: "download" },
    ],
  },
  { group: "", items: [{ href: "/admin/account", label: "Account", icon: "pin" }] },
];

export function AdminShell({ children, unread, email }: { children: React.ReactNode; unread: number; email: string }) {
  const path = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("moa-admin-collapsed") === "1");
    } catch {}
  }, []);
  useEffect(() => setMenu(false), [path]);

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem("moa-admin-collapsed", c ? "0" : "1");
      } catch {}
      return !c;
    });
  };

  const isActive = (href: string) => (href === "/admin" ? path === "/admin" : path.startsWith(href));

  const navList = (compact: boolean) => (
    <nav aria-label="Dashboard" className="space-y-5">
      {NAV.map((g, gi) => (
        <div key={gi}>
          {g.group && !compact && <p className="mb-1.5 px-3 font-mono text-[0.7rem] uppercase tracking-widest text-muted">{g.group}</p>}
          <ul className="space-y-0.5">
            {g.items.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  title={compact ? it.label : undefined}
                  aria-current={isActive(it.href) ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-11 items-center gap-3 rounded-xl px-3 text-[0.95rem] transition-colors",
                    isActive(it.href) ? "bg-accent-soft font-semibold text-accent" : "text-muted hover:bg-surface-2 hover:text-fg",
                    compact && "justify-center px-0",
                  )}
                >
                  <Icon name={it.icon} size={19} />
                  {!compact && <span className="flex-1">{it.label}</span>}
                  {it.badge === "unread" && unread > 0 && (
                    <span
                      className={cn(
                        "grid min-w-6 place-items-center rounded-full bg-accent px-1.5 text-xs font-bold text-on-accent",
                        compact && "absolute right-1 top-1 min-w-5 text-[0.65rem]",
                      )}
                      aria-label={`${unread} unread`}
                    >
                      {unread}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-bg">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-line bg-surface transition-[width] duration-300 lg:flex",
          collapsed ? "w-[76px]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-line px-4", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && (
            <Link href="/admin" className="font-display text-2xl tracking-wide">
              MOA<span className="text-accent">.</span> <span className="font-sans text-sm font-medium text-muted">Studio</span>
            </Link>
          )}
          <button type="button" onClick={toggleCollapsed} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} className="grid h-10 w-10 place-items-center rounded-lg text-muted hover:bg-surface-2">
            <Icon name="chevron" className={collapsed ? "-rotate-90" : "rotate-90"} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">{navList(collapsed)}</div>
        <div className={cn("flex items-center gap-2 border-t border-line p-3", collapsed && "flex-col")}>
          <ThemeToggle />
          <form action={logout} className={cn(!collapsed && "flex-1")}>
            <button type="submit" className="min-h-11 w-full rounded-xl border border-line px-3 text-sm text-muted hover:text-fg" title="Log out">
              {collapsed ? "⎋" : "Log out"}
            </button>
          </form>
        </div>
      </aside>

      {/* Top bar */}
      <header className={cn("sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-line bg-glass px-4 backdrop-blur-xl transition-[padding] duration-300 lg:px-8", collapsed ? "lg:pl-[100px]" : "lg:pl-[280px]")}>
        <Link href="/admin" className="font-display text-2xl lg:hidden">
          MOA<span className="text-accent">.</span>
        </Link>
        <p className="hidden truncate text-sm text-muted sm:block lg:block">{email}</p>
        <div className="ml-auto flex items-center gap-2">
          <a href="/" target="_blank" rel="noopener" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 text-sm font-medium hover:border-accent">
            <Icon name="arrowUpRight" size={16} /> <span className="hidden sm:inline">Preview live site</span>
          </a>
          <span className="lg:hidden">
            <ThemeToggle />
          </span>
        </div>
      </header>

      <main className={cn("px-4 pb-28 pt-6 transition-[padding] duration-300 md:px-8 lg:pb-12", collapsed ? "lg:pl-[108px]" : "lg:pl-[288px]")}>
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav aria-label="Quick" className="pb-safe fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-surface pt-1 lg:hidden">
        {[
          { href: "/admin", label: "Home", icon: "grid" },
          { href: "/admin/projects", label: "Projects", icon: "film" },
          { href: "/admin/messages", label: "Inbox", icon: "mail" },
        ].map((it) => (
          <Link key={it.href} href={it.href} className={cn("relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs", isActive(it.href) ? "text-accent" : "text-muted")}>
            <Icon name={it.icon} />
            {it.label}
            {it.icon === "mail" && unread > 0 && <span className="absolute right-[28%] top-1 h-2.5 w-2.5 rounded-full bg-accent" aria-label={`${unread} unread`} />}
          </Link>
        ))}
        <button type="button" onClick={() => setMenu(true)} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs text-muted" aria-expanded={menu}>
          <Icon name="menu" /> Menu
        </button>
      </nav>

      <AnimatePresence>
        {menu && (
          <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
            <motion.div
              className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-surface"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="flex h-16 items-center justify-between border-b border-line px-4">
                <span className="font-display text-2xl">
                  MOA<span className="text-accent">.</span>
                </span>
                <button type="button" onClick={() => setMenu(false)} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full hover:bg-surface-2">
                  <Icon name="close" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3">{navList(false)}</div>
              <form action={logout} className="border-t border-line p-3">
                <button type="submit" className="min-h-12 w-full rounded-xl border border-line font-medium">
                  Log out
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
