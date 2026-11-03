import type { CataloguePhoto, Collection, Design } from "./types";

const photograph = (
  number: string,
  alt: string,
  width = 2880,
): CataloguePhoto => ({
  src: `/images/florins-${number}.webp`,
  alt,
  width,
  height: 3840,
});

export const photos = {
  emerald: photograph(
    "08",
    "Emerald gown with an asymmetric sculptural shoulder and a flowing train",
    3071,
  ),
  blue: photograph(
    "02",
    "Pale blue floor-length gown with a sweetheart neckline and an embellished bodice",
    2897,
  ),
  print: photograph(
    "03",
    "Mustard bodice with a patterned full skirt and striped hem",
    2889,
  ),
  stripes: photograph(
    "01",
    "White outfit with black and burgundy stripes, worn at a celebration",
  ),
  patterned: photograph(
    "05",
    "Black and white patterned occasion dress photographed in a garden",
  ),
  garden: photograph(
    "06",
    "Full-length garden view of the patterned dress and its flared hem",
  ),
  celebration: photograph(
    "07",
    "The patterned occasion dress photographed alongside a partner",
  ),
  seated: photograph(
    "04",
    "Seated view of the patterned occasion dress at a celebration",
  ),
  burgundy: photograph(
    "09",
    "Burgundy ensemble with white lace detail and a matching headwrap",
    2881,
  ),
};

/** Proposed categories: edit, rename, reorder, add or unpublish here until admin exists. */
export const collectionFixtures: Collection[] = [
  {
    id: "gowns",
    slug: "gowns",
    name: "Gowns",
    description:
      "Sculptural silhouettes and considered details for a defining entrance.",
    cover: photos.emerald,
    sortOrder: 10,
    published: true,
    sample: true,
  },
  {
    id: "prom",
    slug: "prom",
    name: "Prom",
    description: "Expressive evening silhouettes for a moment all your own.",
    cover: photos.blue,
    sortOrder: 20,
    published: true,
    sample: true,
  },
  {
    id: "african-prints",
    slug: "african-prints",
    name: "African Prints",
    description: "Pattern, movement and a distinctive personal expression.",
    cover: photos.print,
    sortOrder: 30,
    published: true,
    sample: true,
  },
  {
    id: "traditional-occasion",
    slug: "traditional-occasion-wear",
    name: "Traditional & Occasion Wear",
    description:
      "An individual perspective on dressing for meaningful celebrations.",
    cover: photos.burgundy,
    sortOrder: 40,
    published: true,
    sample: true,
  },
];

/** Sample metadata only. Photographs are approved; no actual inventory or price is asserted. */
export const designFixtures: Design[] = [
  {
    id: "sample-emerald",
    slug: "sculpted-evening-silhouette",
    name: "Sculpted evening silhouette",
    collectionIds: ["gowns"],
    description:
      "An asymmetric shoulder, a fitted line and a flowing train. Sample editorial copy for a design presentation.",
    photographs: [photos.emerald],
    sizes: null,
    fabric: null,
    price: null,
    making: "custom-made",
    published: true,
    sample: true,
  },
  {
    id: "sample-blue",
    slug: "embellished-evening-silhouette",
    name: "Embellished evening silhouette",
    collectionIds: ["gowns", "prom"],
    description:
      "A sweetheart neckline and an elongated silhouette with an embellished finish. Sample editorial copy; garment specifications are unconfirmed.",
    photographs: [photos.blue],
    sizes: ["S", "M", "L"],
    fabric: "Illustrative fabric entry: embellished tulle",
    price: null,
    making: "ready-made",
    published: true,
    sample: true,
  },
  {
    id: "sample-print",
    slug: "pattern-and-movement",
    name: "Pattern & movement",
    collectionIds: ["african-prints"],
    description:
      "A full skirt brings pattern and contrasting stripes into motion. Sample copy demonstrating the catalogue layout.",
    photographs: [photos.print],
    sizes: null,
    fabric: "Illustrative fabric entry: printed cotton",
    price: null,
    making: "custom-made",
    published: true,
    sample: true,
  },
  {
    id: "sample-stripes",
    slug: "a-study-in-stripes",
    name: "A study in stripes",
    collectionIds: ["african-prints"],
    description:
      "Graphic stripes meet a relaxed, flowing silhouette. A sample design entry using an approved photograph.",
    photographs: [photos.stripes],
    sizes: null,
    fabric: null,
    price: null,
    making: "unconfirmed",
    published: true,
    sample: true,
  },
  {
    id: "sample-patterned",
    slug: "the-occasion-silhouette",
    name: "The occasion silhouette",
    collectionIds: ["traditional-occasion"],
    description:
      "A patterned silhouette with a flared hem, shown across garden and celebration settings. The four supplied photographs let you explore the garment in context. Metadata is a development sample.",
    photographs: [
      photos.patterned,
      photos.garden,
      photos.celebration,
      photos.seated,
    ],
    sizes: null,
    fabric: null,
    price: null,
    making: "custom-made",
    published: true,
    sample: true,
  },
  {
    id: "sample-burgundy",
    slug: "lace-and-ceremony",
    name: "Lace & ceremony",
    collectionIds: ["traditional-occasion"],
    description:
      "A burgundy ensemble with contrasting white detail and a matching headwrap. Sample presentation copy; actual design details are to be confirmed with the studio.",
    photographs: [photos.burgundy],
    sizes: null,
    fabric: null,
    price: null,
    making: "unconfirmed",
    published: true,
    sample: true,
  },
];
