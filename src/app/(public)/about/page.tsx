import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Breadcrumbs,
  CataloguePhotoFrame,
} from "@/components/catalogue/shared";
import { Button } from "@/components/ui/button";
import { FounderSection } from "@/components/founder-section";
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
      </div>
      <FounderSection />
    </main>
  );
}
