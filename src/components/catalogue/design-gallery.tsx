"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  RotateCcw,
  X,
  ZoomIn,
} from "lucide-react";
import type { CataloguePhoto } from "@/lib/catalogue/types";

export function DesignGallery({
  photographs,
  name,
}: {
  photographs: CataloguePhoto[];
  name: string;
}) {
  const [selected, setSelected] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [opened, setOpened] = useState(false);
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const panAnchor = useRef({ x: 0.5, y: 0.5 });
  const photo = photographs[selected];
  useLayoutEffect(() => {
    const frame = viewport.current;
    if (!opened || !frame) return;
    frame.scrollTo({
      left: panAnchor.current.x * frame.scrollWidth - frame.clientWidth / 2,
      top: panAnchor.current.y * frame.scrollHeight - frame.clientHeight / 2,
      behavior: "auto",
    });
  }, [zoom, selected, opened]);
  function changeZoom(next: number) {
    const frame = viewport.current;
    if (frame)
      panAnchor.current = {
        x: (frame.scrollLeft + frame.clientWidth / 2) / frame.scrollWidth,
        y: (frame.scrollTop + frame.clientHeight / 2) / frame.scrollHeight,
      };
    setZoom(next);
  }
  function change(index: number) {
    panAnchor.current = { x: 0.5, y: 0.5 };
    setSelected((index + photographs.length) % photographs.length);
    setZoom(1);
    setImageReady(false);
    setImageFailed(false);
    viewport.current?.scrollTo(0, 0);
  }
  function open() {
    panAnchor.current = { x: 0.5, y: 0.5 };
    setZoom(1);
    setImageReady(false);
    setImageFailed(false);
    setOpened(true);
    dialog.current?.showModal();
  }
  return (
    <div className="design-gallery">
      <button
        className="gallery-open"
        onClick={open}
        aria-label={`Enlarge photograph ${selected + 1} of ${name}`}
        aria-haspopup="dialog"
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="(min-width: 1024px) 55vw, 100vw"
          preload
        />
        <span>
          <ZoomIn size={18} aria-hidden="true" /> Enlarge photograph
        </span>
      </button>
      <div className="gallery-caption">
        <span aria-live="polite">
          Photograph {selected + 1} of {photographs.length}
        </span>
        <span>Original proportions preserved</span>
      </div>
      {photographs.length > 1 && (
        <div className="gallery-thumbnails" aria-label="Choose a photograph">
          {photographs.map((item, index) => (
            <button
              key={item.src}
              onClick={() => change(index)}
              aria-label={`View photograph ${index + 1}`}
              aria-pressed={selected === index}
            >
              <Image
                src={item.src}
                alt={item.alt}
                width={90}
                height={120}
                sizes="90px"
              />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        className="photo-dialog"
        aria-labelledby="zoom-title"
        onClose={() => setOpened(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onKeyDown={(event) => {
          if (
            photographs.length > 1 &&
            (event.key === "ArrowLeft" || event.key === "ArrowRight")
          ) {
            event.preventDefault();
            change(selected + (event.key === "ArrowLeft" ? -1 : 1));
          }
        }}
      >
        <div className="zoom-shell">
          <div className="zoom-heading">
            <h2 id="zoom-title">{name}</h2>
            <button
              className="catalogue-icon-button"
              aria-label="Close enlarged photograph"
              onClick={() => dialog.current?.close()}
            >
              <X aria-hidden="true" />
            </button>
          </div>
          <div className="zoom-toolbar">
            <div>
              <button
                className="catalogue-icon-button"
                aria-label="Zoom out"
                disabled={zoom <= 1}
                onClick={() => changeZoom(Math.max(1, zoom - 0.5))}
              >
                <Minus aria-hidden="true" />
              </button>
              <span aria-live="polite">{zoom * 100}%</span>
              <button
                className="catalogue-icon-button"
                aria-label="Zoom in"
                disabled={zoom >= 3}
                onClick={() => changeZoom(Math.min(3, zoom + 0.5))}
              >
                <Plus aria-hidden="true" />
              </button>
              <button
                className="catalogue-icon-button"
                aria-label="Reset zoom"
                onClick={() => {
                  panAnchor.current = { x: 0.5, y: 0.5 };
                  setZoom(1);
                  viewport.current?.scrollTo(0, 0);
                }}
              >
                <RotateCcw size={18} aria-hidden="true" />
              </button>
            </div>
            {photographs.length > 1 && (
              <div>
                <button
                  className="catalogue-icon-button"
                  aria-label="Previous photograph"
                  onClick={() => change(selected - 1)}
                >
                  <ArrowLeft aria-hidden="true" />
                </button>
                <span aria-live="polite">
                  {selected + 1} / {photographs.length}
                </span>
                <button
                  className="catalogue-icon-button"
                  aria-label="Next photograph"
                  onClick={() => change(selected + 1)}
                >
                  <ArrowRight aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
          <div
            ref={viewport}
            className="zoom-viewport"
            tabIndex={0}
            role="region"
            aria-label="Enlarged photograph. Scroll to explore when zoomed."
            aria-busy={opened && !imageReady && !imageFailed}
          >
            <div
              className="zoom-canvas"
              style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
            >
              {opened && (
                <Image
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes={zoom > 1 ? "200vw" : "100vw"}
                  loading="eager"
                  onLoad={() => setImageReady(true)}
                  onError={() => setImageFailed(true)}
                />
              )}
            </div>
          </div>
          {opened && !imageReady && (
            <p className="zoom-help" role="status">
              {imageFailed
                ? "The photograph could not load. Close this view and try again."
                : "Loading photograph…"}
            </p>
          )}
          <p className="zoom-help">
            Use + to enlarge, then scroll to explore. Escape closes.
            {photographs.length > 1 ? " Arrow keys change photographs." : ""}
          </p>
        </div>
      </dialog>
    </div>
  );
}
