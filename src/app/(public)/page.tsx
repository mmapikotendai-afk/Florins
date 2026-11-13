import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FashionHero } from "@/components/fashion-hero";
import { FounderSection } from "@/components/founder-section";
import { FashionImage } from "@/components/fashion-image";
import { site } from "@/lib/config/site";
import { catalogue } from "@/lib/catalogue/repository";
import { CataloguePhotoFrame } from "@/components/catalogue/shared";

export default async function Home() {
  const collections = await catalogue.listCollections();
  return (
    <main id="main-content">
      <FashionHero />
      <FounderSection id="about" />
      <section
        id="collections"
        className="collections container-editorial section-space"
        aria-labelledby="collections-heading"
      >
        <div className="section-heading">
          <h2 id="collections-heading">The collections</h2>
          <p>
            Different expressions.
            <br />
            The same attention to detail.
          </p>
        </div>
        <div className="collection-grid">
          {collections.map((item) => (
            <article key={item.name} className="collection-item">
              <Link
                href={`/collections/${item.slug}`}
                aria-label={`Explore ${item.name} collection`}
              >
                <CataloguePhotoFrame photo={item.cover} />
                <div className="collection-caption">
                  <div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <ArrowUpRight size={24} aria-hidden="true" />
                </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section
        id="bespoke"
        className="bespoke section-space"
        aria-labelledby="bespoke-heading"
      >
        <div className="container-editorial bespoke-inner">
          <h2 id="bespoke-heading">
            Designed
            <br />
            <em>for You.</em>
          </h2>
          <div>
            <p>
              Your occasion. Your perspective. A design that begins with a
              conversation about what you want to wear and how you want to feel.
            </p>
            <p>Explore a personal approach to bespoke clothing with FLORINS.</p>
            <Button asChild variant="outline">
              <Link href="/bespoke">
                Discover bespoke <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section
        id="atelier"
        className="atelier container-editorial section-space"
        aria-labelledby="atelier-heading"
      >
        <div className="atelier-image">
          <FashionImage
            number="01"
            alt="A FLORINS client wearing a flowing white outfit with black and burgundy stripes"
          />
          <p>A FLORINS creation, worn for a special occasion.</p>
        </div>
        <div className="atelier-copy">
          <h2 id="atelier-heading">
            Where an idea
            <br />
            <em>takes shape.</em>
          </h2>
          <p>
            Step into the world of FLORINS. Our studio in Milton Park, Harare is
            a place to explore your ideas for a custom outfit, in person.
          </p>
          <p>
            Visits are by appointment, with space for a conversation about your
            occasion and your vision.
          </p>
          <Link href="/appointments" className="text-link">
            Book an appointment <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <span className="location-note">Milton Park · Harare · Zimbabwe</span>
        </div>
      </section>
      <section
        id="creations"
        className="creations container-editorial section-space"
        aria-labelledby="creations-heading"
      >
        <div className="section-heading">
          <h2 id="creations-heading">Selected creations</h2>
          <Link href={site.instagram} className="text-link">
            View on Instagram <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className="creation-gallery">
          <FashionImage
            number="09"
            alt="A burgundy FLORINS ensemble with white lace detail and a matching headwrap"
            className="creation-1"
          />
          <FashionImage
            number="06"
            alt="A FLORINS client in a patterned dress with a flared hem, photographed in a garden"
            className="creation-2"
          />
          <FashionImage
            number="07"
            alt="A couple at a celebration, with a FLORINS patterned occasion dress"
            className="creation-3"
          />
        </div>
      </section>
      <section
        id="appointment"
        className="appointment section-space"
        aria-labelledby="appointment-heading"
      >
        <div className="container-editorial">
          <h2 id="appointment-heading">
            Your Vision.
            <br />
            <em>Our Craft.</em>
          </h2>
          <p>
            Begin a conversation about your next occasion.
            <br />
            Studio consultations in Milton Park, Harare, by appointment.
          </p>
          <Button asChild variant="outline">
            <Link href="/appointments">
              Book your consultation <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
          <p className="appointment-note">
            Enquire via Instagram @florins.zw to arrange your visit.
          </p>
        </div>
      </section>
    </main>
  );
}
