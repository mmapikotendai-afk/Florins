import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function CatalogueNotFound() {
  return (
    <main
      id="main-content"
      className="catalogue-not-found container-editorial section-space"
    >
      <h1>
        This page is
        <br />
        <em>not in the collection.</em>
      </h1>
      <p>
        The collection or design may have moved or is not published. Explore the
        current collections to find your way back.
      </p>
      <Button asChild>
        <Link href="/collections">Explore collections</Link>
      </Button>
    </main>
  );
}
