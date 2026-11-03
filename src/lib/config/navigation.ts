export const mainNavigation = [
  { label: "Home", href: "/" },
  { label: "Collections", href: "/collections" },
  { label: "Bespoke", href: "/bespoke" },
  { label: "The Atelier", href: "/atelier" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export function isCurrentPage(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
