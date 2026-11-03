import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import {
  Breadcrumbs,
  CataloguePhotoFrame,
} from "@/components/catalogue/shared";
import { EnquiryForm } from "@/components/bespoke/enquiry-form";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { photos } from "@/lib/catalogue/fixtures";

export const metadata: Metadata = {
  title: "Bespoke",
  description:
    "Explore a personal approach to fashion with Florins. Discuss your occasion, design ideas and a proposed consultation journey.",
};
const process = [
  [
    "Consultation",
    "Share your occasion, inspiration and what matters to you in an outfit.",
  ],
  [
    "Design Discussion",
    "Explore the silhouette, details and direction of your proposed design.",
  ],
  [
    "Fabric Selection",
    "Discuss suitable fabrics, colours and finishes with the studio.",
  ],
  ["Measurements", "Agree how measurements will be taken for your design."],
  [
    "Creation",
    "Your agreed design takes shape through the studio's confirmed making process.",
  ],
  [
    "Fitting",
    "Discuss fit, comfort and any adjustments appropriate to your design.",
  ],
  [
    "Final Collection",
    "Arrange collection of the finished outfit once the final details are agreed.",
  ],
];
export default function BespokePage() {
  return (
    <main id="main-content" className="editorial-page">
      <div className="container-editorial">
        <Breadcrumbs items={[{ label: "Bespoke" }]} />
        <section className="editorial-hero" aria-labelledby="bespoke-title">
          <div className="editorial-hero-copy">
            <Reveal>
              <h1 id="bespoke-title">
                An idea.
                <br />
                <em>Made personal.</em>
              </h1>
              <p>
                Bespoke fashion begins with a conversation about you. Your
                occasion. Your perspective. Your own expression.
              </p>
              <Button asChild>
                <Link href="#enquiry">
                  Book consultation <ArrowUpRight aria-hidden="true" />
                </Link>
              </Button>
            </Reveal>
            <Link href="#proposed-process" className="text-link">
              Explore the proposed journey{" "}
              <ArrowDown size={16} aria-hidden="true" />
            </Link>
          </div>
          <figure>
            <CataloguePhotoFrame
              photo={photos.emerald}
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
            />
            <figcaption>
              A Florins creation. Inspiration for a personal design
              conversation.
            </figcaption>
          </figure>
        </section>
        <section
          className="editorial-introduction section-space"
          aria-labelledby="bespoke-intro"
        >
          <h2 id="bespoke-intro">
            Bespoke begins
            <br />
            <em>with you.</em>
          </h2>
          <div>
            <p>
              A silhouette you have imagined. A colour you keep returning to. An
              occasion that calls for something personal.
            </p>
            <p>
              Explore these ideas with Florins, an exclusive fashion designer in
              Milton Park, Harare. Bespoke offers a space to discuss the line,
              fabric and details you would like to make your own.
            </p>
            <p>
              The studio will confirm what is possible, together with timing,
              fittings and cost, before you make arrangements.
            </p>
          </div>
        </section>
        <section
          className="bespoke-inspiration section-space"
          aria-labelledby="inspiration-title"
        >
          <div className="section-heading">
            <h2 id="inspiration-title">
              A personal
              <br />
              <em>point of view.</em>
            </h2>
            <p>
              Approved Florins garment photographs, shown as inspiration rather
              than a confirmed bespoke range.
            </p>
          </div>
          <div className="editorial-photo-gallery">
            <figure>
              <CataloguePhotoFrame photo={photos.print} />
              <figcaption>Pattern &amp; movement</figcaption>
            </figure>
            <figure>
              <CataloguePhotoFrame photo={photos.burgundy} />
              <figcaption>Celebration dressing</figcaption>
            </figure>
            <figure>
              <CataloguePhotoFrame photo={photos.patterned} />
              <figcaption>Line &amp; silhouette</figcaption>
            </figure>
          </div>
        </section>
        <section
          id="proposed-process"
          className="proposed-process section-space"
          aria-labelledby="process-title"
        >
          <div className="process-introduction">
            <h2 id="process-title">
              From conversation
              <br />
              <em>to creation.</em>
            </h2>
            <p className="proposed-note">
              <strong>A proposed design journey.</strong> This sequence is for
              discussion until Florins confirms its actual workflow. Timing,
              fabric arrangements and the number of fittings are not yet
              confirmed.
            </p>
          </div>
          <ol>
            {process.map(([title, description], index) => (
              <li key={title}>
                <h3>{title}</h3>
                <p>{description}</p>
                {index < process.length - 1 && (
                  <ArrowDown size={20} aria-hidden="true" />
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>
      <section
        id="measurements"
        className="measurements-section section-space"
        aria-labelledby="measurements-title"
      >
        <div className="container-editorial">
          <h2 id="measurements-title">
            The fit.
            <br />
            <em>The feeling.</em>
          </h2>
          <div>
            <p>
              Measurements and fittings are part of the conversation about how
              your outfit should look, feel and move.
            </p>
            <p>
              Ask Florins to confirm how measurements should be taken, what to
              bring and which fittings your design may need. Avoid relying on an
              unconfirmed fitting schedule when planning your occasion.
            </p>
            <Link href="/atelier" className="text-link">
              Discover the atelier <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <section
        id="enquiry"
        className="enquiry-section container-editorial section-space"
        aria-labelledby="enquiry-title"
      >
        <div className="enquiry-introduction">
          <h2 id="enquiry-title">
            Tell us what
            <br />
            <em>you imagine.</em>
          </h2>
          <p>
            Prepare the details of your occasion and the design you have in
            mind, then begin a conversation with the studio.
          </p>
          <p>
            Preferred dates are requests, not confirmed appointments. Visits to
            the Milton Park studio are by appointment only.
          </p>
          <p className="field-help">
            Fields marked optional can be left blank.
          </p>
        </div>
        <EnquiryForm />
      </section>
    </main>
  );
}
