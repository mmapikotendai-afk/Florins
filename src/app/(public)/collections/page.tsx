import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { catalogue } from "@/lib/catalogue/repository";
import {
  Breadcrumbs,
  CatalogueEmpty,
  CollectionCard,
  DesignCard,
  SampleNotice,
} from "@/components/catalogue/shared";

export const metadata: Metadata = {
  title: "Collections",
  description:
    "Explore the FLORINS collections experience. A clearly labelled sample catalogue using approved garment photography.",
};

export default async function CollectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const collections = await catalogue.listCollections();
  const { category } = await searchParams;
  const slug = typeof category === "string" ? category : "";
  const selected = collections.find((item) => item.slug === slug);
  const invalid = Boolean(slug && !selected);
  const designs = invalid ? [] : await catalogue.listDesigns(selected?.id);
  return (
    <main id="main-content" className="catalogue-page container-editorial">
      <Breadcrumbs items={[{ label: "Collections" }]} />
      <div className="catalogue-intro">
        <h1>
          The
          <br />
          <em>collections.</em>
        </h1>
        <div>
          <p>
            Different expressions.
            <br />
            The same attention to detail.
          </p>
          <p>
            Explore silhouettes for your occasion, then begin a conversation
            about a design of your own.
          </p>
          <Link href="#designs" className="text-link">
            Browse sample designs <ArrowDown size={16} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <SampleNotice />
      <section
        className="catalogue-collection-grid"
        aria-label="Explore the collections"
      >
        {collections.map((item) => (
          <CollectionCard key={item.id} collection={item} />
        ))}
      </section>
      <section
        id="designs"
        className="catalogue-designs"
        aria-labelledby="designs-heading"
      >
        <div className="section-heading">
          <h2 id="designs-heading">The design edit</h2>
          <p>Sample entries. A closer look at the possibilities.</p>
        </div>
        <form
          action="/collections#designs"
          method="get"
          className="catalogue-filter"
        >
          <div>
            <label htmlFor="category">Collection</label>
            <select
              name="category"
              id="category"
              defaultValue={slug}
              key={slug}
            >
              {invalid && <option value={slug}>Unknown collection</option>}
              <option value="">All collections</option>
              {collections.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Apply filter</button>
          {slug && <Link href="/collections#designs">Clear filter</Link>}
          <p role="status">
            {designs.length} sample{" "}
            {designs.length === 1 ? "design" : "designs"}
            {selected ? ` · ${selected.name}` : ""}
          </p>
        </form>
        {designs.length ? (
          <div className="design-grid">
            {designs.map((design) => (
              <DesignCard
                key={design.id}
                design={design}
                collection={
                  selected ??
                  collections.find((item) =>
                    design.collectionIds.includes(item.id),
                  )!
                }
              />
            ))}
          </div>
        ) : (
          <CatalogueEmpty
            title={invalid ? "This collection is not available." : undefined}
          >
            {invalid
              ? "Choose one of the proposed collections or clear the filter to return to all sample designs."
              : undefined}
          </CatalogueEmpty>
        )}
      </section>
      <div className="catalogue-invitation">
        <h2>Something entirely your own.</h2>
        <Link href="/appointments" className="text-link">
          Discuss a bespoke design <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </main>
  );
}
