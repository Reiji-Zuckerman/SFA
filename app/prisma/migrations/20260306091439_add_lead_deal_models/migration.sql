/*
  Warnings:

  - You are about to drop the column `channel` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `fsOwnerId` on the `Opportunity` table. All the data in the column will be lost.
  - You are about to drop the column `isOwnerId` on the `Opportunity` table. All the data in the column will be lost.
  - Added the required column `dealId` to the `Opportunity` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "channel" TEXT,
    "isOwnerId" TEXT,
    "fsOwnerId" TEXT,
    "reapproachDate" DATETIME,
    "lostReason" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Lead_isOwnerId_fkey" FOREIGN KEY ("isOwnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_fsOwnerId_fkey" FOREIGN KEY ("fsOwnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Deal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT,
    "ownerId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Deal_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Deal_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Opportunity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentOpportunityId" TEXT,
    "dealId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "clientDepartmentId" TEXT,
    "contactId" TEXT,
    "recordType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phase" TEXT NOT NULL,
    "buOwnerId" TEXT,
    "expectedAmount" INTEGER,
    "expectedCloseDate" DATETIME,
    "reapproachDate" DATETIME,
    "lostReason" TEXT,
    "powerAgelessUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Opportunity_parentOpportunityId_fkey" FOREIGN KEY ("parentOpportunityId") REFERENCES "Opportunity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Opportunity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Opportunity_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Opportunity_clientDepartmentId_fkey" FOREIGN KEY ("clientDepartmentId") REFERENCES "ClientDepartment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Opportunity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Opportunity_buOwnerId_fkey" FOREIGN KEY ("buOwnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Opportunity" ("accountId", "buOwnerId", "clientDepartmentId", "contactId", "createdAt", "expectedAmount", "expectedCloseDate", "id", "lostReason", "name", "notes", "parentOpportunityId", "phase", "powerAgelessUrl", "reapproachDate", "recordType", "updatedAt") SELECT "accountId", "buOwnerId", "clientDepartmentId", "contactId", "createdAt", "expectedAmount", "expectedCloseDate", "id", "lostReason", "name", "notes", "parentOpportunityId", "phase", "powerAgelessUrl", "reapproachDate", "recordType", "updatedAt" FROM "Opportunity";
DROP TABLE "Opportunity";
ALTER TABLE "new_Opportunity" RENAME TO "Opportunity";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
