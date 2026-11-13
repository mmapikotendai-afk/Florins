"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { isCurrentPage, mainNavigation } from "@/lib/config/navigation";

export function SiteHeader() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);
  const open = openPath === pathname;
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.querySelector<HTMLAnchorElement>("a")?.focus();
    function keys(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenPath(null);
        toggle.current?.focus();
      }
      const links = panel.current?.querySelectorAll<HTMLAnchorElement>("a");
      const last = links?.[links.length - 1];
      if (
        event.key === "Tab" &&
        event.shiftKey &&
        document.activeElement === toggle.current
      ) {
        event.preventDefault();
        last?.focus();
      } else if (
        event.key === "Tab" &&
        !event.shiftKey &&
        document.activeElement === last
      ) {
        event.preventDefault();
        toggle.current?.focus();
      }
    }
    const desktop = matchMedia("(min-width: 1280px)");
    function resize() {
      if (desktop.matches) setOpenPath(null);
    }
    desktop.addEventListener("change", resize);
    document.addEventListener("keydown", keys);
    return () => {
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", resize);
      document.removeEventListener("keydown", keys);
    };
  }, [open]);
  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY >= 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [overHero]);
  function navigate() {
    setOpenPath(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function navigationLink(item: (typeof mainNavigation)[number]) {
    return (
      <Link
        key={item.href}
        href={item.href}
        onNavigate={navigate}
        aria-current={isCurrentPage(pathname, item.href) ? "page" : undefined}
      >
        {item.label}
      </Link>
    );
  }
  return (
    <header
      className={`site-header${overHero && !scrolled ? " site-header--overlay" : ""}`}
    >
      <div className="header-inner container-editorial">
        <Link
          className="brand"
          href="/"
          aria-label="FLORINS home"
          onNavigate={navigate}
        >
          <Image
            src="/images/florins-logo.jpeg"
            alt="FLORINS"
            width={44}
            height={44}
            priority
          />
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <div className="nav-group">
            {mainNavigation.slice(0, 3).map(navigationLink)}
          </div>
          <div className="nav-group nav-group-right">
            {mainNavigation.slice(3).map(navigationLink)}
          </div>
        </nav>
        <button
          ref={toggle}
          className="menu-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpenPath(open ? null : pathname)}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>
      {open && (
        <div id="mobile-menu" ref={panel} className="mobile-menu">
          <nav aria-label="Mobile navigation">
            {mainNavigation.map(navigationLink)}
          </nav>
          <p>
            Milton Park, Harare
            <br />
            Studio visits by appointment.
          </p>
        </div>
      )}
    </header>
  );
}
