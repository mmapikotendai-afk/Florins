"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/config/site";
export default function PublicError({ reset }: { reset: () => void }) {
  return (
    <main id="main-content" className="container-editorial section-space">
      <h1>Please try again.</h1>
      <p className="mt-8 max-w-prose">
        This page is temporarily unavailable. Your information has not been
        displayed. Please retry or contact Florins directly.
      </p>
      <div className="mt-8 flex flex-wrap gap-6">
        <Button onClick={reset}>Try again</Button>
        <Button asChild variant="outline">
          <Link href={site.whatsapp}>Contact Florins</Link>
        </Button>
      </div>
    </main>
  );
}
