import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RouteStart } from "@/components/layout/route-start";
export const dynamic = "force-dynamic";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <RouteStart />
      <SiteHeader />
      <div className="site-content">{children}</div>
      <SiteFooter />
    </>
  );
}
