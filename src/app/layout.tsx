import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "@fontsource-variable/manrope/wght.css";
import "./globals.css";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  icons: {
    icon: "/images/florins-logo.jpeg",
    apple: "/images/florins-logo.jpeg",
  },
  title: {
    default: `${site.name} — ${site.positioning}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZW">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
