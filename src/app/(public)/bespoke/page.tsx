import type { Metadata } from "next";
import { MasonryGallery } from "@/components/masonry-gallery";
import { photos } from "@/lib/catalogue/fixtures";
import type { CataloguePhoto } from "@/lib/catalogue/types";

export const metadata: Metadata = {
  title: "Bespoke",
  description:
    "A gallery of Florins bespoke creations: gowns, African prints and special-occasion fashion from Milton Park, Harare.",
};

const slide = (number: number, alt: string): CataloguePhoto => ({
  src: `/images/florins-hero-slide-${number}.png`,
  alt,
  width: 2560,
  height: 1440,
});

const photographs: CataloguePhoto[] = [
  photos.emerald,
  slide(
    1,
    "Strapless African print gown with red lace panels and a flared hem",
  ),
  photos.blue,
  photos.print,
  slide(
    3,
    "Royal blue one-shoulder gown with a beaded bodice and a tiered tulle hem",
  ),
  photos.burgundy,
  photos.stripes,
  slide(
    2,
    "White dress with geometric print panels, a white cape and a matching headwrap",
  ),
  photos.patterned,
  photos.garden,
  slide(
    4,
    "Floor-length black evening gown with a sculpted neckline and a sequinned bodice",
  ),
  photos.celebration,
  photos.seated,
];

export default function BespokePage() {
  return (
    <main id="main-content" className="gallery-page">
      <h1 className="sr-only">Bespoke</h1>
      <MasonryGallery photographs={photographs} />
    </main>
  );
}
