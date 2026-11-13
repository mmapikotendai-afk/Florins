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
  title: "Workshops",
  description:
    "The Art of Creation at FLORINS. Discover fashion craftsmanship, African textiles and bespoke design workshops in Milton Park, Harare.",
};

const pillars = [
  {
    number: "01",
    title: "Inspiration",
    subtitle: "Creative Philosophy & Vision",
    description:
      "Step inside the founder’s creative world. Learn how faith, culture and a passion for distinction shape every design, and how to look at form, silhouette and storytelling in fashion.",
    photo: photos.emerald,
  },
  {
    number: "02",
    title: "Education",
    subtitle: "Technique, Textiles & Construction",
    description:
      "Hands-on study of the craft: understanding garment construction, working with contemporary African textiles, pattern drafting, and the meticulous hand-finishing behind bespoke couture.",
    photo: photos.print,
  },
  {
    number: "03",
    title: "Experience",
    subtitle: "Private Sessions & Group Masterclasses",
    description:
      "Small-group workshops and one-on-one atelier sessions tailored to your pace. Create a signature piece, refine your technique or arrange a private creative day at the studio.",
    photo: photos.burgundy,
  },
];

export default function WorkshopsPage() {
  return (
    <main id="main-content" className="editorial-page workshops-page">
      <div className="container-editorial">
        <Breadcrumbs items={[{ label: "Workshops" }]} />

        {/* Section 1: The Art of Creation */}
        <section
          className="editorial-hero workshops-hero"
          aria-labelledby="workshops-title"
        >
          <div className="editorial-hero-copy">
            <p className="workshops-eyebrow">Fashion. Craftsmanship. Expression.</p>
            <h1 id="workshops-title">
              The Art
              <br />
              <em>of Creation.</em>
            </h1>
            <p>
              At FLORINS, we believe fashion is more than what we wear; it is an
              expression of who we are. Through our workshops, we share the
              art of garment creation, from the first sketch to the finished
              piece.
            </p>
            <p>
              Whether exploring the beauty of African textiles, learning the
              foundations of garment construction or discovering the process
              behind bespoke design, each experience offers an opportunity to
              learn, create and express individuality.
            </p>
            <p className="workshops-tagline">
              Discover the art of making something uniquely yours.
            </p>
            <Button asChild>
              <Link href="/contact#enquiry">
                Enquire about workshops <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <figure>
            <CataloguePhotoFrame
              photo={photos.stripes}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <figcaption>
              Hands-on creation and textile exploration inside the FLORINS atelier.
            </figcaption>
          </figure>
        </section>

        {/* Section 2: Three Pillars — Inspiration, Education, Experience */}
        <section
          className="workshops-pillars section-space"
          aria-labelledby="pillars-title"
        >
          <div className="section-heading">
            <h2 id="pillars-title">
              What you will
              <br />
              <em>discover.</em>
            </h2>
            <p>
              Three core dimensions guiding every workshop experience at FLORINS.
            </p>
          </div>
          <div className="workshops-pillar-grid">
            {pillars.map((pillar) => (
              <article key={pillar.number} className="workshops-pillar-card">
                <div className="pillar-photo-wrap">
                  <CataloguePhotoFrame photo={pillar.photo} />
                </div>
                <div className="pillar-copy">
                  <span className="pillar-number">{pillar.number}</span>
                  <h3>{pillar.title}</h3>
                  <p className="pillar-subtitle">{pillar.subtitle}</p>
                  <p className="pillar-desc">{pillar.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Section 3: Call to action — Your Creative Journey Starts Here */}
        <section
          className="workshops-cta section-space"
          aria-labelledby="journey-title"
        >
          <div className="workshops-cta-inner">
            <h2 id="journey-title">
              Your creative journey
              <br />
              <em>starts here.</em>
            </h2>
            <p>
              Whether you’re discovering fashion for the first time or looking
              to refine your craft, there’s a place for you at FLORINS.
            </p>
            <Button asChild>
              <Link href="/contact#enquiry">
                Enquire about workshops <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
