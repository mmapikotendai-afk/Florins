import type { CataloguePhoto } from "@/lib/catalogue/types";

/** Replace null only with approved photographs of the actual FLORINS studio. */
export const studioGallery: {
  key: string;
  label: string;
  photo: CataloguePhoto | null;
}[] = [
  { key: "interior", label: "Inside the studio", photo: null },
  { key: "worktable", label: "At the worktable", photo: null },
  { key: "fittings", label: "The fitting space", photo: null },
];
