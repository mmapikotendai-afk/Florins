import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Breadcrumbs,
  CataloguePhotoFrame,
} from "@/components/catalogue/shared";
import { Button } from "@/components/ui/button";
import { photos } from "@/lib/catalogue/fixtures";

export const metadata: Metadata = {
  title: "About Florins",
  description:
    "Meet Florins, an exclusive Zimbabwean fashion designer based in Milton Park, Harare. Gowns, African prints and personal occasion wear.",
};

export default function AboutPage() {
  return (
    <main id="main-content" className="editorial-page information-page">
      <div className="container-editorial">
        <Breadcrumbs items={[{ label: "About" }]} />
        <section className="editorial-hero" aria-labelledby="about-title">
          <div className="editorial-hero-copy">
            <h1 id="about-title">
              About Florins.
              <br />
              <em>A personal expression.</em>
            </h1>
            <p>
              Exclusive fashion design from Milton Park, Harare. Gowns, African
              prints, bespoke clothing and special-occasion fashion, with your
              perspective at the heart of the conversation.
            </p>
            <Button asChild>
              <Link href="/collections">
                Explore collections <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <figure>
            <CataloguePhotoFrame
              photo={photos.emerald}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <figcaption>
              A supplied Florins creation. Photography celebrates the design; it
              does not indicate current stock.
            </figcaption>
          </figure>
        </section>
        <section
          className="editorial-introduction section-space"
          aria-labelledby="about-expression"
        >
          <h2 id="about-expression">
            Your occasion.
            <br />
            <em>Your point of view.</em>
          </h2>
          <div>
            <p>
              What you wear can be a personal expression of the moment. Explore
              silhouettes, pattern and detail, then bring your own ideas to
              Florins.
            </p>
            <p>
              For a custom outfit, begin with a conversation about your occasion
              and the design you have in mind. Fabric, measurements and fitting
              arrangements are discussed directly with the studio.
            </p>
            <Link className="text-link" href="/bespoke">
              Discover bespoke <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section
          className="information-visit section-space"
          aria-labelledby="about-visit"
        >
          <h2 id="about-visit">
            Meet us
            <br />
            <em>in the atelier.</em>
          </h2>
          <div>
            <p>
              Florins is based in Milton Park, Harare, Zimbabwe. Visits are by
              appointment, allowing you to discuss your ideas in person.
            </p>
            <Link className="text-link" href="/atelier">
              Explore the atelier <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
            <Link className="text-link" href="/contact">
              Get in touch <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
