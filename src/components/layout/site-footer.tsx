import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/config/site";
import { mainNavigation } from "@/lib/config/navigation";
export function SiteFooter() {
  return (
    <footer id="contact" className="site-footer">
      <div className="container-editorial">
        <div className="footer-main">
          <div>
            <Link className="footer-brand" href="/">
              <Image
                src="/images/florins-logo.jpeg"
                alt=""
                width={56}
                height={56}
              />
              <span>FLORINS</span>
            </Link>
            <p>Exclusive Fashion Designer</p>
          </div>
          <nav aria-label="Footer navigation">
            {mainNavigation.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div>
            <h2>Visit the studio</h2>
            <p>
              Milton Park, Harare
              <br />
              Zimbabwe
            </p>
            <p>By appointment only.</p>
            <Link href="/appointments" className="text-link">
              Arrange a visit <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="footer-contact">
            <h2>Get in touch</h2>
            <Link href={site.instagram} className="text-link">
              Instagram @florins.zw{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link href={site.whatsapp} className="text-link">
              WhatsApp {site.phoneDisplay}{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link href={site.phoneHref} className="text-link">
              Call {site.phoneDisplay}
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FLORINS. All rights reserved.</p>
          <Link href="#main-content">
            Back to top <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
