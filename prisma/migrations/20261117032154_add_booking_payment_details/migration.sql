-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "amountDue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "depositAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING';
