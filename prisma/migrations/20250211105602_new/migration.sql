/*
  Warnings:

  - You are about to drop the column `upiTransactionId` on the `Subscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "upiTransactionId",
ADD COLUMN     "customerUpiId" TEXT;
