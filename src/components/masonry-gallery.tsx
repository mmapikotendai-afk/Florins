"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import type { CataloguePhoto } from "@/lib/catalogue/types";

export function MasonryGallery({
  photographs,
}: {
  photographs: CataloguePhoto[];
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const photo = selected === null ? null : photographs[selected];
  function change(step: number) {
    setSelected((current) =>
      current === null
        ? current
        : (current + step + photographs.length) % photographs.length,
    );
  }
  return (
    <>
      <ul className="masonry-gallery">
        {photographs.map((item, index) => (
          <li key={item.src}>
            <button
              aria-label={`Enlarge photograph ${index + 1} of ${photographs.length}`}
              aria-haspopup="dialog"
              onClick={() => {
                setSelected(index);
                dialog.current?.showModal();
              }}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 1440px) 25vw, (min-width: 1024px) 33vw, (min-width: 560px) 50vw, 100vw"
                loading={index < 4 ? "eager" : "lazy"}
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        className="lightbox"
        aria-label="Enlarged photograph"
        onClose={() => setSelected(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            change(event.key === "ArrowLeft" ? -1 : 1);
          }
        }}
      >
        {photo && (
          <Image
            key={photo.src}
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="100vw"
            loading="eager"
          />
        )}
        <button
          className="lightbox-close"
          aria-label="Close enlarged photograph"
          onClick={() => dialog.current?.close()}
        >
          <X aria-hidden="true" />
        </button>
        <button
          className="lightbox-previous"
          aria-label="Previous photograph"
          onClick={() => change(-1)}
        >
          <ArrowLeft aria-hidden="true" />
        </button>
        <button
          className="lightbox-next"
          aria-label="Next photograph"
          onClick={() => change(1)}
        >
          <ArrowRight aria-hidden="true" />
        </button>
        {selected !== null && (
          <p aria-live="polite">
            {selected + 1} / {photographs.length}
          </p>
        )}
      </dialog>
    </>
  );
}
