import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const slides = [
  {
    desktop: "/images/florins-hero-slide-1.png",
    mobile: "/images/florins-hero-slide-mb1.png",
  },
  {
    desktop: "/images/florins-hero-slide-2.png",
    mobile: "/images/florins-hero-slide-mb2.png",
  },
  {
    desktop: "/images/florins-hero-slide-3.png",
    mobile: "/images/florins-hero-slide-mb3.png",
  },
  {
    desktop: "/images/florins-hero-slide-4.png",
    mobile: "/images/florins-hero-slide-mb4.png",
  },
];

export function FashionHero() {
  return (
    <section id="home" className="fashion-hero" aria-labelledby="hero-heading">
      <div className="fashion-hero-track">
        {slides.map((slide, index) => {
          const { props: mobile } = getImageProps({
            src: slide.mobile,
            width: 1080,
            height: 1920,
            alt: "",
            sizes: "(max-width: 767px) 100vw",
          });
          return (
            <picture
              key={slide.desktop}
              className="fashion-hero-slide"
              style={{ animationDelay: `${index * 12}s` }}
            >
              <source
                media="(max-width: 767px)"
                srcSet={mobile.srcSet}
                sizes={mobile.sizes}
              />
              <Image
                src={slide.desktop}
                width={2560}
                height={1440}
                sizes="100vw"
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : undefined}
                alt={
                  index === 0
                    ? "A Florins model in a floor-length black evening gown with a sculpted neckline and a sequinned bodice."
                    : ""
                }
                className="fashion-hero-image"
              />
            </picture>
          );
        })}
      </div>
      <div className="fashion-hero-scrim" aria-hidden="true" />
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
      <div className="fashion-hero-dots" aria-hidden="true">
        {slides.map((slide, index) => (
          <span
            key={slide.desktop}
            className="fashion-hero-dot"
            style={{ animationDelay: `${index * 12}s` }}
          />
        ))}
      </div>
    </section>
  );
}
