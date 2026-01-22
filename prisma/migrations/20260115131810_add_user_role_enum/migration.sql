-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('VISITOR', 'STAFF', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'VISITOR';
