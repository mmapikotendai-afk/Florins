import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { catalogue } from "@/lib/catalogue/repository";
import {
  Breadcrumbs,
  CatalogueEmpty,
  CataloguePhotoFrame,
  DesignCard,
  SampleNotice,
} from "@/components/catalogue/shared";

type Props = { params: Promise<{ collection: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await catalogue.getCollection((await params).collection);
  return { title: item ? `${item.name} Collection` : "Collection not found" };
}
export default async function CollectionPage({ params }: Props) {
  const collection = await catalogue.getCollection((await params).collection);
  if (!collection) notFound();
  const designs = await catalogue.listDesigns(collection.id);
  return (
    <main id="main-content" className="catalogue-page container-editorial">
      <Breadcrumbs
        items={[
          { label: "Collections", href: "/collections" },
          { label: collection.name },
        ]}
      />
      <div className="collection-page-intro">
        <div>
          <h1>{collection.name}</h1>
          <p>{collection.description}</p>
          <Link href="/collections" className="text-link">
            Explore all collections{" "}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <CataloguePhotoFrame
          photo={collection.cover}
          priority
          sizes="(min-width: 768px) 30vw, 70vw"
        />
      </div>
      {collection.sample && <SampleNotice />}
      <section
        className="catalogue-designs"
        aria-labelledby="collection-designs-heading"
      >
        <div className="section-heading">
          <h2 id="collection-designs-heading">The designs</h2>
          <p>
            {designs.length} sample{" "}
            {designs.length === 1 ? "design" : "designs"}
          </p>
        </div>
        {designs.length ? (
          <div className="design-grid collection-design-grid">
            {designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                collection={collection}
              />
            ))}
          </div>
        ) : (
          <CatalogueEmpty />
        )}
      </section>
      <div className="catalogue-invitation">
        <h2>A personal expression.</h2>
        <Link href="/appointments" className="text-link">
          Book an appointment <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
