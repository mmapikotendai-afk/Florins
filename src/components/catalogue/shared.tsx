import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CataloguePhoto, Collection, Design } from "@/lib/catalogue/types";

export function CataloguePhotoFrame({
  photo,
  sizes = "(min-width: 768px) 45vw, 100vw",
  priority = false,
}: {
  photo: CataloguePhoto;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className="catalogue-photo">
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        preload={priority}
      />
    </div>
  );
}

export function SampleNotice() {
  return (
    <aside className="sample-notice" aria-label="Sample catalogue information">
      <strong>Sample catalogue</strong>
      <p>
        Approved FLORINS photographs with illustrative names, categories and
        design details. This development preview does not confirm products,
        pricing or availability.
      </p>
    </aside>
  );
}

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="catalogue-breadcrumb">
      <ol>
        <li>
          <Link href="/">Home</Link>
        </li>
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link href={item.href}>{item.label}</Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CollectionCard({ collection }: { collection: Collection }) {
  return (
    <article className="catalogue-collection-card">
      <Link
        href={`/collections/${collection.slug}`}
        aria-label={`View ${collection.name} collection`}
        className="catalogue-image-link"
      >
        <CataloguePhotoFrame photo={collection.cover} />
      </Link>
      <div className="catalogue-collection-copy">
        <h2>
          <Link href={`/collections/${collection.slug}`}>
            {collection.name}
          </Link>
        </h2>
        <p>{collection.description}</p>
        <Button asChild variant="outline">
          <Link href={`/collections/${collection.slug}`}>
            View collection <ArrowUpRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </article>
  );
}

export const makingLabels = {
  "custom-made": "Custom-made",
  "ready-made": "Ready-made",
  unconfirmed: "Making status to confirm",
};

export function DesignCard({
  design,
  collection,
}: {
  design: Design;
  collection: Collection;
}) {
  const href = `/collections/${collection.slug}/${design.slug}`;
  return (
    <article className="design-card">
      <Link
        href={href}
        className="catalogue-image-link"
        aria-label={`View ${design.name}${design.sample ? ", sample design" : ""}`}
      >
        <CataloguePhotoFrame
          photo={design.photographs[0]}
          sizes="(min-width: 1024px) 30vw, (min-width: 600px) 45vw, 100vw"
        />
      </Link>
      <div className="design-card-meta">
        <span>{design.sample ? "Sample design" : collection.name}</span>
        <span>
          {design.sample ? "Sample: " : ""}
          {makingLabels[design.making]}
        </span>
      </div>
      <h3>
        <Link href={href}>{design.name}</Link>
      </h3>
      <p>{design.description}</p>
      <Link href={href} className="text-link">
        View design <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </article>
  );
}

export function CatalogueEmpty({
  title = "A new collection is taking shape.",
  children,
}: {
  title?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="catalogue-empty">
      <h2>{title}</h2>
      <p>
        {children ??
          "There are no published designs in this collection yet. Explore the other collections or speak with the studio about your occasion."}
      </p>
      <Link href="/collections#designs" className="text-link">
        Explore all designs <ArrowUpRight size={16} aria-hidden="true" />
      </Link>
    </div>
  );
}
