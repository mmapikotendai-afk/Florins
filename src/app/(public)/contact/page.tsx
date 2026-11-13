import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { EnquiryForm } from "@/components/bespoke/enquiry-form";
import { Breadcrumbs } from "@/components/catalogue/shared";
import { site } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Contact Florins",
  description:
    "Contact Florins on WhatsApp or by phone at +263 771 640 916. Studio visits in Milton Park, Harare, Zimbabwe are by appointment.",
};

export default function ContactPage() {
  return (
    <main id="main-content" className="editorial-page information-page">
      <div className="container-editorial">
        <Breadcrumbs items={[{ label: "Contact" }]} />
        <section
          className="contact-introduction"
          aria-labelledby="contact-title"
        >
          <h1 id="contact-title">
            Let’s begin
            <br />
            <em>a conversation.</em>
          </h1>
          <p>
            Tell us about your occasion, share an idea or arrange a visit.
            Contact Florins directly to discuss your next step.
          </p>
        </section>
        <section className="contact-details" aria-label="Contact Florins">
          <div className="contact-channels">
            <a href={site.whatsapp}>
              <span>
                WhatsApp<strong>{site.phoneDisplay}</strong>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href={site.phoneHref}>
              <span>
                Call the studio<strong>{site.phoneDisplay}</strong>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
            <a href={site.instagram}>
              <span>
                Instagram<strong>@florins.zw</strong>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
          <div className="contact-visit">
            <h2>
              A visit,
              <br />
              <em>by appointment.</em>
            </h2>
            <address>{site.location}</address>
            <p>
              Please contact Florins to confirm your appointment and receive
              directions before travelling.
            </p>
            <Link href="/atelier" className="text-link">
              About the atelier <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
        <section
          className="information-visit section-space"
          aria-labelledby="contact-design"
        >
          <h2 id="contact-design">
            An idea
            <br />
            <em>of your own?</em>
          </h2>
          <div>
            <p>
              Use the bespoke enquiry builder to prepare your design details,
              then share the draft with Florins on WhatsApp.
            </p>
            <Link href="#enquiry" className="text-link">
              Prepare a bespoke enquiry{" "}
              <ArrowDown size={16} aria-hidden="true" />
            </Link>
            <p className="contact-demo-note">
              You can also explore the appointment booking demonstration. It
              uses mock availability and does not reserve studio time.
            </p>
            <Link href="/appointments" className="text-link">
              Explore appointment demo{" "}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
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
