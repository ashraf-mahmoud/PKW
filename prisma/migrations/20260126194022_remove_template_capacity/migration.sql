/*
  Warnings:

  - You are about to drop the column `coachId` on the `ClassSession` table. All the data in the column will be lost.
  - You are about to drop the column `capacity` on the `ClassTemplate` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Student` table without a default value. This is not possible if the table is not empty.
  - Made the column `dob` on table `Student` required. This step will fail if there are existing NULL values in that column.
  - Made the column `parentId` on table `Student` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Location" ADD COLUMN "attireInfo" TEXT;
ALTER TABLE "Location" ADD COLUMN "description" TEXT;
ALTER TABLE "Location" ADD COLUMN "directionVideoUrl" TEXT;
ALTER TABLE "Location" ADD COLUMN "rules" TEXT;

-- CreateTable
CREATE TABLE "ClassSchedule" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "ageGroupId" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "capacity" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClassSchedule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ClassTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ClassSchedule_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClassSchedule_ageGroupId_fkey" FOREIGN KEY ("ageGroupId") REFERENCES "AgeGroup" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgeGroup" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "minAge" INTEGER NOT NULL,
    "maxAge" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "creditCount" INTEGER NOT NULL,
    "validityDays" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "PackagePrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "packageId" TEXT NOT NULL,
    "ageGroupId" TEXT NOT NULL,
    "price" DECIMAL NOT NULL,
    CONSTRAINT "PackagePrice_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PackagePrice_ageGroupId_fkey" FOREIGN KEY ("ageGroupId") REFERENCES "AgeGroup" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StudentPackage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "remainingCredits" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "paymentId" TEXT,
    CONSTRAINT "StudentPackage_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentPackage_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StudentPackage_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "studentId" TEXT NOT NULL,
    "packageId" TEXT,
    "amount" DECIMAL NOT NULL,
    "method" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "reference" TEXT,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ScheduleCoaches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_ScheduleCoaches_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassSchedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ScheduleCoaches_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_SessionCoaches" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_SessionCoaches_A_fkey" FOREIGN KEY ("A") REFERENCES "ClassSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_SessionCoaches_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "scheduleId" TEXT,
    "locationId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    CONSTRAINT "ClassSession_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ClassTemplate" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ClassSession_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "ClassSchedule" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "ClassSession_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ClassSession" ("endTime", "id", "locationId", "startTime", "templateId") SELECT "endTime", "id", "locationId", "startTime", "templateId" FROM "ClassSession";
DROP TABLE "ClassSession";
ALTER TABLE "new_ClassSession" RENAME TO "ClassSession";
CREATE TABLE "new_ClassTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PARKOUR',
    "levelMin" INTEGER NOT NULL DEFAULT 1,
    "levelMax" INTEGER NOT NULL DEFAULT 6,
    "price" REAL NOT NULL DEFAULT 0.0,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "ageMin" INTEGER NOT NULL DEFAULT 5,
    "ageMax" INTEGER NOT NULL DEFAULT 17
);
INSERT INTO "new_ClassTemplate" ("ageMax", "ageMin", "description", "durationMin", "id", "levelMax", "levelMin", "name", "price", "type") SELECT "ageMax", "ageMin", "description", "durationMin", "id", "levelMax", "levelMin", "name", "price", "type" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
CREATE TABLE "new_Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "studentCode" TEXT,
    "dob" DATETIME NOT NULL,
    "medicalInfo" TEXT,
    "waiverSigned" BOOLEAN NOT NULL DEFAULT false,
    "waiverFile" TEXT,
    "level" INTEGER NOT NULL DEFAULT 1,
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("createdAt", "dob", "id", "isTrial", "level", "name", "parentId") SELECT "createdAt", "dob", "id", "isTrial", "level", "name", "parentId" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE TABLE "new_UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phone" TEXT,
    "phone2" TEXT,
    "address" TEXT,
    "marketingSource" TEXT,
    "trialDate" DATETIME,
    "waiverSigned" BOOLEAN NOT NULL DEFAULT false,
    "waiverFile" TEXT,
    "ecName" TEXT,
    "ecPhone" TEXT,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserProfile" ("address", "ecName", "ecPhone", "id", "phone", "userId") SELECT "address", "ecName", "ecPhone", "id", "phone", "userId" FROM "UserProfile";
DROP TABLE "UserProfile";
ALTER TABLE "new_UserProfile" RENAME TO "UserProfile";
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "PackagePrice_packageId_ageGroupId_key" ON "PackagePrice"("packageId", "ageGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentPackage_paymentId_key" ON "StudentPackage"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "_ScheduleCoaches_AB_unique" ON "_ScheduleCoaches"("A", "B");

-- CreateIndex
CREATE INDEX "_ScheduleCoaches_B_index" ON "_ScheduleCoaches"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SessionCoaches_AB_unique" ON "_SessionCoaches"("A", "B");

-- CreateIndex
CREATE INDEX "_SessionCoaches_B_index" ON "_SessionCoaches"("B");
