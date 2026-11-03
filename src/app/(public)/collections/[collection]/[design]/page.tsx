import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { catalogue } from "@/lib/catalogue/repository";
import {
  Breadcrumbs,
  makingLabels,
  SampleNotice,
} from "@/components/catalogue/shared";
import { DesignGallery } from "@/components/catalogue/design-gallery";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/config/site";

type Props = { params: Promise<{ collection: string; design: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  const collection = await catalogue.getCollection(values.collection);
  const design = collection
    ? await catalogue.getDesign(collection.id, values.design)
    : null;
  return {
    title: design
      ? `${design.name}${design.sample ? " — Sample design" : ""}`
      : "Design not found",
  };
}
export default async function DesignPage({ params }: Props) {
  const values = await params;
  const collection = await catalogue.getCollection(values.collection);
  if (!collection) notFound();
  const design = await catalogue.getDesign(collection.id, values.design);
  if (!design) notFound();
  return (
    <main id="main-content" className="catalogue-page container-editorial">
      <Breadcrumbs
        items={[
          { label: "Collections", href: "/collections" },
          { label: collection.name, href: `/collections/${collection.slug}` },
          { label: design.name },
        ]}
      />
      {design.sample && <SampleNotice />}
      <div className="design-detail">
        <DesignGallery photographs={design.photographs} name={design.name} />
        <div className="design-information">
          <h1>{design.name}</h1>
          {design.sample && (
            <p className="sample-design-label">
              Sample design · Development content
            </p>
          )}
          <p className="design-description">{design.description}</p>
          <dl className="design-specifications">
            <div>
              <dt>Making</dt>
              <dd>
                {design.sample ? "Sample: " : ""}
                {makingLabels[design.making]}
              </dd>
            </div>
            <div>
              <dt>Sizes</dt>
              <dd>
                {design.sizes?.length
                  ? `${design.sample ? "Sample sizes: " : ""}${design.sizes.join(", ")}`
                  : "Discuss sizing with the studio"}
              </dd>
            </div>
            <div>
              <dt>Fabric</dt>
              <dd>{design.fabric ?? "Fabric details to be confirmed"}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd>
                {design.price
                  ? `${design.sample ? "Sample price: " : ""}${new Intl.NumberFormat("en", { style: "currency", currency: design.price.currency }).format(design.price.amountMinor / 100)}`
                  : "Price on enquiry"}
              </dd>
            </div>
          </dl>
          <div className="design-actions">
            <Button asChild>
              <a href={site.instagram}>
                Enquire <ArrowUpRight aria-hidden="true" />
              </a>
            </Button>
            <Button asChild variant="outline">
              <Link href="/appointments">
                Book appointment <ArrowUpRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <p className="design-enquiry-note">
            Enquiries open the verified @florins.zw Instagram profile.{" "}
            {design.sample
              ? "Sample names, sizes and making status are not confirmed product details; discuss your own requirements with the studio."
              : "Discuss details and availability directly with the studio."}
          </p>
          <p className="design-location">
            Milton Park, Harare · By appointment
          </p>
        </div>
      </div>
      <div className="catalogue-invitation">
        <h2>Continue exploring.</h2>
        <Link href={`/collections/${collection.slug}`} className="text-link">
          Back to {collection.name}{" "}
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
