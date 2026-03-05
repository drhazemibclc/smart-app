-- AlterTable
ALTER TABLE "Drug" ADD COLUMN     "category" TEXT,
ADD COLUMN     "form" TEXT,
ADD COLUMN     "genericName" TEXT,
ADD COLUMN     "isAvailable" BOOLEAN,
ADD COLUMN     "isControlled" BOOLEAN,
ADD COLUMN     "requiresPrescription" BOOLEAN,
ADD COLUMN     "strength" TEXT,
ADD COLUMN     "strengthUnit" TEXT;
