import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/catalogue/shared";
import { BookingExperience } from "@/components/booking/booking-experience";
import { listServices } from "@/lib/server/appointments";
import { developmentDataAllowed } from "@/lib/server/security";
import { site } from "@/lib/config/site";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Appointments",
  description:
    "Request an appointment with Florins. Availability uses Harare time, and appointment requests are subject to studio confirmation.",
};
export default async function AppointmentsPage() {
  const services = await listServices().catch(() => null);
  return (
    <main id="main-content" className="booking-page container-editorial">
      <Breadcrumbs items={[{ label: "Appointments" }]} />
      <div className="booking-introduction">
        <h1>
          Time for
          <br />
          <em>your vision.</em>
        </h1>
        <p>
          Choose a service, find a suitable time and request an appointment with
          Florins.
        </p>
      </div>
      {services?.length ? (
        <BookingExperience
          services={services}
          development={developmentDataAllowed()}
        />
      ) : (
        <div className="booking-error">
          <h2>Let’s arrange your visit.</h2>
          <p className="mt-6">
            Online appointment requests are not currently available. Please{" "}
            <Link className="underline" href={site.whatsapp}>
              contact Florins on WhatsApp
            </Link>{" "}
            to discuss a visit. No appointment has been reserved by this page.
          </p>
        </div>
      )}
    </main>
  );
}
