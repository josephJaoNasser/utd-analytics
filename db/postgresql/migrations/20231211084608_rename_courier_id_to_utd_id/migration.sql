/*
  Warnings:

  - You are about to drop the column `courierId` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "courierId",
ADD COLUMN     "utdId" VARCHAR(255);
