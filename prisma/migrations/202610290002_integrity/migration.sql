-- Prisma does not express PostgreSQL exclusion constraints. Keep this migration intact.
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA public;
SET search_path = public, extensions;

ALTER TABLE "Appointment"
  ADD CONSTRAINT "Appointment_positive_interval" CHECK ("endsAt" > "startsAt" AND "durationMinutes" BETWEEN 5 AND 480 AND "endsAt" = "startsAt" + "durationMinutes" * INTERVAL '1 minute'),
  ADD CONSTRAINT "Appointment_event_after_visit" CHECK ("eventDate" IS NULL OR "eventDate" >= ("startsAt" AT TIME ZONE 'Africa/Harare')::date),
  ADD CONSTRAINT "Appointment_positive_version" CHECK ("version" > 0),
  ADD CONSTRAINT "Appointment_cancelled_timestamp" CHECK (("status" = 'CANCELLED') = ("cancelledAt" IS NOT NULL)),
  ADD CONSTRAINT "Appointment_no_overlap" EXCLUDE USING gist
    ("staffId" WITH =, tstzrange("startsAt", "endsAt", '[)') WITH &&)
    WHERE ("status" IN ('REQUESTED', 'CONFIRMED'));

ALTER TABLE "AppointmentService"
  ADD CONSTRAINT "Service_duration" CHECK ("durationMinutes" BETWEEN 5 AND 480),
  ADD CONSTRAINT "Service_interval" CHECK ("intervalMinutes" BETWEEN 5 AND 120);
ALTER TABLE "StaffAvailability"
  ADD CONSTRAINT "Availability_weekday" CHECK ("weekday" BETWEEN 0 AND 6),
  ADD CONSTRAINT "Availability_minutes" CHECK ("startMinute" >= 0 AND "endMinute" <= 1440 AND "startMinute" < "endMinute");
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_positive_interval" CHECK ("endsAt" > "startsAt");
ALTER TABLE "Product"
  ADD CONSTRAINT "Product_price" CHECK (("amountMinor" IS NULL AND "currency" IS NULL) OR ("amountMinor" IS NOT NULL AND "currency" IS NOT NULL AND "amountMinor" >= 0 AND "currency" ~ '^[A-Z]{3}$')),
  ADD CONSTRAINT "Product_slug" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE "Collection"
  ADD CONSTRAINT "Collection_cover" CHECK ("coverWidth" > 0 AND "coverHeight" > 0),
  ADD CONSTRAINT "Collection_slug" CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
ALTER TABLE "ProductImage" ADD CONSTRAINT "Image_dimensions_position" CHECK ("width" > 0 AND "height" > 0 AND "position" >= 0);
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_lengths" CHECK (char_length("fullName") BETWEEN 2 AND 100 AND char_length("email") BETWEEN 3 AND 254 AND char_length("phone") BETWEEN 7 AND 32);
ALTER TABLE "BespokeEnquiry" ADD CONSTRAINT "Enquiry_dates" CHECK ("eventDate" IS NULL OR "preferredDate" IS NULL OR "preferredDate" <= "eventDate");
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_one_subject" CHECK (num_nonnulls("appointmentId", "enquiryId") = 1);
ALTER TABLE "RateLimitBucket" ADD CONSTRAINT "RateLimit_positive" CHECK ("count" > 0);

-- Supabase's Data API must not expose application tables. Prisma stays server-side.
-- Table owners/BYPASSRLS runtime roles use Prisma; no anon/authenticated policies exist.
DO $$
DECLARE table_name text; api_role text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY['MediaAsset','AdminUser','Collection','Product','ProductImage','Customer','AppointmentService','Staff','StaffAvailability','BlockedDate','Appointment','BespokeEnquiry','Notification','RateLimitBucket','_CollectionToProduct','_AppointmentServiceToStaff'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
    EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', table_name);
    FOREACH api_role IN ARRAY ARRAY['anon','authenticated'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = api_role) THEN
        EXECUTE format('REVOKE ALL ON TABLE public.%I FROM %I', table_name, api_role);
      END IF;
    END LOOP;
  END LOOP;
END $$;
