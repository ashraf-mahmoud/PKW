-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ClassTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'PARKOUR',
    "levelMin" INTEGER NOT NULL DEFAULT 1,
    "levelMax" INTEGER NOT NULL DEFAULT 6,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "price" REAL NOT NULL DEFAULT 0.0,
    "durationMin" INTEGER NOT NULL DEFAULT 60,
    "ageMin" INTEGER NOT NULL DEFAULT 5,
    "ageMax" INTEGER NOT NULL DEFAULT 17
);
INSERT INTO "new_ClassTemplate" ("capacity", "description", "durationMin", "id", "levelMax", "levelMin", "name", "price", "type") SELECT "capacity", "description", "durationMin", "id", "levelMax", "levelMin", "name", "price", "type" FROM "ClassTemplate";
DROP TABLE "ClassTemplate";
ALTER TABLE "new_ClassTemplate" RENAME TO "ClassTemplate";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
