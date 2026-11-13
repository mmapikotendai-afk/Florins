import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import {
  Breadcrumbs,
  CataloguePhotoFrame,
} from "@/components/catalogue/shared";
import { StudioVisit } from "@/components/editorial/studio-visit";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { photos } from "@/lib/catalogue/fixtures";
import { studioGallery } from "@/lib/config/studio-gallery";

export const metadata: Metadata = {
  title: "The Atelier",
  description:
    "Discover Florins in Milton Park, Harare. Studio visits are by appointment; discuss your ideas and fitting arrangements directly with the studio.",
};
export default function AtelierPage() {
  return (
    <main id="main-content" className="editorial-page">
      <div className="container-editorial">
        <Breadcrumbs items={[{ label: "The Atelier" }]} />
        <section
          className="editorial-hero editorial-hero-reverse"
          aria-labelledby="atelier-title"
        >
          <div className="editorial-hero-copy">
            <Reveal>
              <h1 id="atelier-title">
                The atelier.
                <br />
                <em>
                  Your ideas,
                  <br />
                  in person.
                </em>
              </h1>
              <p>
                Florins, Milton Park, Harare.
                <br />A personal conversation about the outfit you have in mind.
                Studio visits by appointment.
              </p>
              <Button asChild>
                <Link href="/appointments">
                  Book appointment <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </Reveal>
          </div>
          <figure>
            <CataloguePhotoFrame
              photo={photos.stripes}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <figcaption>
              A Florins creation, photographed at a celebration.
            </figcaption>
          </figure>
        </section>
        <section
          className="editorial-introduction section-space"
          aria-labelledby="atelier-intro"
        >
          <h2 id="atelier-intro">
            A space for
            <br />
            <em>your perspective.</em>
          </h2>
          <div>
            <p>
              Florins is an exclusive fashion designer based in Milton Park,
              Harare, creating gowns, African prints, bespoke clothing and
              special-occasion fashion.
            </p>
            <p>
              An appointment is an opportunity to bring your ideas into a
              conversation: the occasion, the silhouette and how you want to
              feel when you wear it.
            </p>
            <Link href="/bespoke" className="text-link">
              Explore bespoke <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section
          className="atelier-philosophy section-space"
          aria-labelledby="philosophy-title"
        >
          <div>
            <h2 id="philosophy-title">
              Expression,
              <br />
              <em>in every detail.</em>
            </h2>
            <p>
              Silhouette, pattern and the way a garment is worn give a design
              its character. Begin with what speaks to you, then discuss your
              own direction with Florins.
            </p>
            <h3>Looking closely.</h3>
            <p>
              The balance of a neckline. The fall of a skirt. A considered
              finish. These are details to explore when discussing the
              craftsmanship of your outfit.
            </p>
          </div>
          <figure>
            <CataloguePhotoFrame photo={photos.print} />
            <figcaption>
              Pattern and proportion in a supplied Florins creation.
            </figcaption>
          </figure>
        </section>
        <section
          className="atelier-fittings section-space"
          aria-labelledby="fittings-title"
        >
          <figure>
            <CataloguePhotoFrame photo={photos.blue} />
            <figcaption>
              A Florins evening silhouette, photographed at an event.
            </figcaption>
          </figure>
          <div>
            <h2 id="fittings-title">
              Room
              <br />
              <em>to refine.</em>
            </h2>
            <p>
              Talk about fit, comfort and the way you want to move in your
              outfit. The studio will confirm measurement arrangements and the
              fittings appropriate to your design.
            </p>
            <p>
              Bring your questions to the conversation. Fitting schedules,
              alterations and what to bring should be agreed directly with
              Florins.
            </p>
            <Link href="/contact#enquiry" className="text-link">
              Begin an enquiry{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section
          className="studio-gallery-section section-space"
          aria-labelledby="studio-gallery-title"
        >
          <div className="section-heading">
            <h2 id="studio-gallery-title">Inside the studio</h2>
            <p>
              Studio photography awaits approved images from Florins. The spaces
              below are marked for replacement.
            </p>
          </div>
          <div className="studio-gallery">
            {studioGallery.map((item) => (
              <figure key={item.key}>
                {item.photo ? (
                  <CataloguePhotoFrame photo={item.photo} />
                ) : (
                  <div className="studio-photo-placeholder">
                    <span>{item.label}</span>
                    <p>Approved studio photograph to follow</p>
                  </div>
                )}
                <figcaption>{item.label}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      </div>
      <StudioVisit />
    </main>
  );
}
