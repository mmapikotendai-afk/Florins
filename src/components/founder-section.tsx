import Image from "next/image";

export function FounderSection({ id }: { id?: string }) {
  return (
    <section
      id={id}
      className="founder-section"
      aria-labelledby="founder-heading"
    >
      <div className="container-editorial founder-grid">
        <div className="founder-image">
          <Image
            src="/images/founder.png"
            alt="FLORINS founder"
            width={948}
            height={1060}
            sizes="(max-width: 767px) 100vw, 40vw"
          />
        </div>
        <div className="intro-copy">
          <h2 id="founder-heading">Meet our founder</h2>
          <p>
            Established in 2020, FLORINS is the realisation of a vision first
            conceived in 2014 — a journey driven by creativity, faith and the
            belief that all things are possible through Christ who strengthens
            me (Philippians 4:13).
          </p>
        </div>
      </div>
    </section>
  );
}
