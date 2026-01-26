-- AlterTable
ALTER TABLE "Location" ADD COLUMN "googleMapsUrl" TEXT;

-- CreateTable
CREATE TABLE "LocationImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "url" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    CONSTRAINT "LocationImage_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
