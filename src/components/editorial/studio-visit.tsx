import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { site } from "@/lib/config/site";
import { Button } from "@/components/ui/button";

export function StudioVisit() {
  return (
    <section
      className="studio-visit section-space"
      aria-labelledby="studio-visit-title"
    >
      <div className="container-editorial">
        <h2 id="studio-visit-title">
          Visit, by
          <br />
          <em>appointment.</em>
        </h2>
        <div>
          <p>{site.location}</p>
          <p>
            Arrange your visit with Florins for directions and appointment
            details. Your preferred date is a request; the studio will confirm
            arrangements directly.
          </p>
          <Button asChild variant="outline">
            <Link href="/appointments">
              Book appointment <ArrowUpRight aria-hidden="true" />
            </Link>
          </Button>
          <Link href={site.whatsapp} className="text-link">
            WhatsApp {site.phoneDisplay}{" "}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
          <Link href={site.phoneHref} className="text-link">
            Call {site.phoneDisplay}
          </Link>
        </div>
      </div>
    </section>
  );
}
