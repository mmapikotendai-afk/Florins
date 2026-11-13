export const mainNavigation = [
  { label: "About", href: "/about" },
  { label: "Portfolio", href: "/collections" },
  { label: "Bespoke", href: "/bespoke" },
  { label: "The Atelier", href: "/atelier" },
  { label: "Workshops", href: "/workshops" },
  { label: "Contact", href: "/contact" },
] as const;

export function isCurrentPage(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}
