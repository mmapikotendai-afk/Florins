import "server-only";
import { getDb } from "@/lib/db/prisma";
import { developmentDataAllowed } from "@/lib/server/security";
import type { Prisma, Collection as Row } from "@/generated/prisma/client";
import type { CatalogueRepository, Collection, Design } from "./types";
const publicWhere = () => ({
  published: true,
  ...(developmentDataAllowed() ? {} : { sample: false }),
});
const safeImage = (src: string) =>
  /^\/images\/[a-zA-Z0-9_-]+\.(webp|jpe?g|png)$/.test(src);
function collectionDto(row: Row): Collection {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    cover: {
      src: row.coverSrc,
      alt: row.coverAlt,
      width: row.coverWidth,
      height: row.coverHeight,
    },
    sortOrder: row.sortOrder,
    published: row.published,
    sample: row.sample,
  };
}
type ProductRow = Prisma.ProductGetPayload<{
  include: { images: true; collections: true };
}>;
function designDto(row: ProductRow): Design | null {
  const photos = row.images
    .filter((image) => safeImage(image.src))
    .map(({ src, alt, width, height }) => ({ src, alt, width, height }));
  if (!photos.length) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    collectionIds: row.collections
      .filter(
        (item) => item.published && (developmentDataAllowed() || !item.sample),
      )
      .map((item) => item.id),
    photographs: photos as Design["photographs"],
    sizes: row.sizes.length ? row.sizes : null,
    fabric: row.fabric,
    price:
      row.amountMinor !== null && row.currency
        ? { amountMinor: row.amountMinor, currency: row.currency }
        : null,
    making:
      row.making === "CUSTOM_MADE"
        ? "custom-made"
        : row.making === "READY_MADE"
          ? "ready-made"
          : "unconfirmed",
    published: row.published,
    sample: row.sample,
  };
}
/** No mock fallback: callers show the route error boundary if PostgreSQL is unavailable. */
export const catalogue: CatalogueRepository = {
  async listCollections() {
    const rows = await getDb().collection.findMany({
      where: publicWhere(),
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
    return rows.filter((row) => safeImage(row.coverSrc)).map(collectionDto);
  },
  async getCollection(slug) {
    const row = await getDb().collection.findFirst({
      where: { slug, ...publicWhere() },
    });
    return row && safeImage(row.coverSrc) ? collectionDto(row) : null;
  },
  async listDesigns(collectionId) {
    const rows = await getDb().product.findMany({
      where: {
        ...publicWhere(),
        collections: {
          some: {
            ...publicWhere(),
            ...(collectionId ? { id: collectionId } : {}),
          },
        },
      },
      include: { images: { orderBy: { position: "asc" } }, collections: true },
      orderBy: { createdAt: "asc" },
    });
    return rows.map(designDto).filter((item): item is Design => item !== null);
  },
  async getDesign(collectionId, slug) {
    return (
      (await this.listDesigns(collectionId)).find(
        (item) => item.slug === slug,
      ) ?? null
    );
  },
};
