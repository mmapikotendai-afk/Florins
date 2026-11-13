import type { Metadata } from "next";
import Link from "next/link";
import { catalogue } from "@/lib/catalogue/repository";
import {
  Breadcrumbs,
  CatalogueEmpty,
  DesignCard,
} from "@/components/catalogue/shared";

export const metadata: Metadata = {
  title: "Portfolio",
  description:
    "Explore the FLORINS portfolio of bespoke creations, gowns, and special-occasion fashion.",
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
      <Breadcrumbs items={[{ label: "Portfolio" }]} />
      <section
        id="designs"
        className="catalogue-designs"
        aria-labelledby="designs-heading"
      >
        <div className="section-heading">
          <h1 id="designs-heading">The design edit</h1>
          <p>Explore silhouettes and creations for your occasion.</p>
        </div>
        <form action="/collections" method="get" className="catalogue-filter">
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
          {slug && <Link href="/collections">Clear filter</Link>}
          <p role="status">
            {designs.length} {designs.length === 1 ? "design" : "designs"}
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
              ? "Choose one of the proposed collections or clear the filter to return to all designs."
              : undefined}
          </CatalogueEmpty>
        )}
      </section>
    </main>
  );
}
