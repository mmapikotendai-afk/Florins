import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FashionHero() {
  const { props: mobile } = getImageProps({
    src: "/images/florins-hero-mobile.png",
    width: 1080,
    height: 1920,
    alt: "",
    sizes: "(max-width: 767px) 300px, 100vw",
  });

  return (
    <section id="home" className="fashion-hero" aria-labelledby="hero-heading">
      <picture className="fashion-hero-photograph">
        <source
          media="(max-width: 767px)"
          srcSet={mobile.srcSet}
          sizes={mobile.sizes}
        />
        <Image
          src="/images/florins-hero-desktop.png"
          width={2560}
          height={1440}
          sizes="(max-width: 1023px) 1500px, 1920px"
          loading="eager"
          fetchPriority="high"
          alt="A Florins model in a floor-length black evening gown with a sculpted neckline and a sequinned bodice."
          className="fashion-hero-image"
        />
      </picture>
      <div className="fashion-hero-content">
        <p className="fashion-hero-brand">FLORINS</p>
        <h1 id="hero-heading">
          Elegance in
          <br />
          <em>Every Detail.</em>
        </h1>
        <p className="fashion-hero-description">
          Discover exclusive fashion, bespoke designs, and timeless creations
          crafted for your most memorable moments.
        </p>
        <div className="fashion-hero-actions">
          <Button asChild>
            <Link href="/collections">
              Explore collections <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/appointments">
              Book an appointment <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
