export type CataloguePhoto = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export type Collection = {
  id: string;
  slug: string;
  name: string;
  description: string;
  cover: CataloguePhoto;
  sortOrder: number;
  published: boolean;
  sample: boolean;
};

export type Design = {
  id: string;
  slug: string;
  name: string;
  collectionIds: string[];
  description: string;
  photographs: [CataloguePhoto, ...CataloguePhoto[]];
  sizes: string[] | null;
  fabric: string | null;
  /** Minor currency units; null means no confirmed price. */
  price: { amountMinor: number; currency: string } | null;
  making: "custom-made" | "ready-made" | "unconfirmed";
  published: boolean;
  sample: boolean;
};

/** Map future Prisma records into these DTOs, not directly into components. */
export interface CatalogueRepository {
  listCollections(): Promise<Collection[]>;
  getCollection(slug: string): Promise<Collection | null>;
  listDesigns(collectionId?: string): Promise<Design[]>;
  getDesign(collectionId: string, slug: string): Promise<Design | null>;
}
