/*
  Warnings:

  - Added the required column `reference` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "total" DOUBLE PRECISION NOT NULL;
