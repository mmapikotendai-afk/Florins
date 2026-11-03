-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('OWNER', 'ADMIN');

-- CreateEnum
CREATE TYPE "MakingStatus" AS ENUM ('CUSTOM_MADE', 'READY_MADE', 'UNCONFIRMED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('REQUESTED', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW');

-- CreateEnum
CREATE TYPE "EnquiryStatus" AS ENUM ('NEW', 'REVIEWING', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" UUID NOT NULL,
    "authUserId" UUID NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'ADMIN',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "coverSrc" TEXT NOT NULL,
    "coverAlt" TEXT NOT NULL,
    "coverWidth" INTEGER NOT NULL,
    "coverHeight" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "sizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "fabric" TEXT,
    "amountMinor" INTEGER,
    "currency" VARCHAR(3),
    "making" "MakingStatus" NOT NULL DEFAULT 'UNCONFIRMED',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "sample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "src" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ProductImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppointmentService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "intervalMinutes" INTEGER NOT NULL DEFAULT 30,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "sample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AppointmentService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Staff" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "sample" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAvailability" (
    "id" UUID NOT NULL,
    "staffId" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "startMinute" INTEGER NOT NULL,
    "endMinute" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "StaffAvailability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockedDate" (
    "id" UUID NOT NULL,
    "staffId" UUID,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "serviceId" TEXT NOT NULL,
    "serviceName" TEXT NOT NULL,
    "staffId" UUID NOT NULL,
    "startsAt" TIMESTAMPTZ(3) NOT NULL,
    "endsAt" TIMESTAMPTZ(3) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'REQUESTED',
    "eventDate" DATE,
    "notes" TEXT,
    "managementTokenHash" TEXT NOT NULL,
    "idempotencyKeyHash" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "cancelledAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BespokeEnquiry" (
    "id" UUID NOT NULL,
    "reference" TEXT NOT NULL,
    "customerId" UUID NOT NULL,
    "occasion" TEXT NOT NULL,
    "preferredDate" DATE,
    "eventDate" DATE,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "status" "EnquiryStatus" NOT NULL DEFAULT 'NEW',
    "idempotencyKeyHash" TEXT NOT NULL,
    "requestHash" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "BespokeEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "customerId" UUID NOT NULL,
    "appointmentId" UUID,
    "enquiryId" UUID,
    "kind" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMPTZ(3),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RateLimitBucket" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "_CollectionToProduct" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CollectionToProduct_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_AppointmentServiceToStaff" (
    "A" TEXT NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_AppointmentServiceToStaff_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "MediaAsset_path_key" ON "MediaAsset"("path");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_authUserId_key" ON "AdminUser"("authUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_slug_key" ON "Collection"("slug");

-- CreateIndex
CREATE INDEX "Collection_published_sortOrder_idx" ON "Collection"("published", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_published_createdAt_idx" ON "Product"("published", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_productId_position_key" ON "ProductImage"("productId", "position");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "Customer_createdAt_idx" ON "Customer"("createdAt");

-- CreateIndex
CREATE INDEX "AppointmentService_enabled_sample_idx" ON "AppointmentService"("enabled", "sample");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAvailability_staffId_weekday_startMinute_key" ON "StaffAvailability"("staffId", "weekday", "startMinute");

-- CreateIndex
CREATE INDEX "BlockedDate_staffId_startsAt_endsAt_idx" ON "BlockedDate"("staffId", "startsAt", "endsAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_reference_key" ON "Appointment"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_idempotencyKeyHash_key" ON "Appointment"("idempotencyKeyHash");

-- CreateIndex
CREATE INDEX "Appointment_staffId_status_startsAt_endsAt_idx" ON "Appointment"("staffId", "status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "Appointment_customerId_createdAt_idx" ON "Appointment"("customerId", "createdAt");

-- CreateIndex
CREATE INDEX "Appointment_status_startsAt_idx" ON "Appointment"("status", "startsAt");

-- CreateIndex
CREATE UNIQUE INDEX "BespokeEnquiry_reference_key" ON "BespokeEnquiry"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "BespokeEnquiry_idempotencyKeyHash_key" ON "BespokeEnquiry"("idempotencyKeyHash");

-- CreateIndex
CREATE INDEX "BespokeEnquiry_status_createdAt_idx" ON "BespokeEnquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "BespokeEnquiry_customerId_idx" ON "BespokeEnquiry"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Notification_dedupeKey_key" ON "Notification"("dedupeKey");

-- CreateIndex
CREATE INDEX "Notification_status_createdAt_idx" ON "Notification"("status", "createdAt");

-- CreateIndex
CREATE INDEX "RateLimitBucket_expiresAt_idx" ON "RateLimitBucket"("expiresAt");

-- CreateIndex
CREATE INDEX "_CollectionToProduct_B_index" ON "_CollectionToProduct"("B");

-- CreateIndex
CREATE INDEX "_AppointmentServiceToStaff_B_index" ON "_AppointmentServiceToStaff"("B");

-- AddForeignKey
ALTER TABLE "ProductImage" ADD CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAvailability" ADD CONSTRAINT "StaffAvailability_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockedDate" ADD CONSTRAINT "BlockedDate_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "AppointmentService"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BespokeEnquiry" ADD CONSTRAINT "BespokeEnquiry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "BespokeEnquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToProduct" ADD CONSTRAINT "_CollectionToProduct_A_fkey" FOREIGN KEY ("A") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CollectionToProduct" ADD CONSTRAINT "_CollectionToProduct_B_fkey" FOREIGN KEY ("B") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentServiceToStaff" ADD CONSTRAINT "_AppointmentServiceToStaff_A_fkey" FOREIGN KEY ("A") REFERENCES "AppointmentService"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AppointmentServiceToStaff" ADD CONSTRAINT "_AppointmentServiceToStaff_B_fkey" FOREIGN KEY ("B") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;
