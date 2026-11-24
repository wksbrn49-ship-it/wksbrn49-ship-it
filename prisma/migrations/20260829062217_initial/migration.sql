-- CreateEnum
CREATE TYPE "BookingType" AS ENUM ('SAFARI', 'FLIGHT', 'HOTEL', 'CAR_HIRE');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "bookingCode" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "type" "BookingType" NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KES',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SafariBooking" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "safariName" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SafariBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FlightBooking" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "airline" TEXT NOT NULL,
    "departure" TEXT NOT NULL,
    "arrival" TEXT NOT NULL,
    "departureDate" TIMESTAMP(3) NOT NULL,
    "returnDate" TIMESTAMP(3),
    "tripType" TEXT NOT NULL,

    CONSTRAINT "FlightBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HotelBooking" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "hotelName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "rooms" INTEGER NOT NULL DEFAULT 1,
    "guests" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "HotelBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarHireBooking" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "vehicleName" TEXT NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "dropoffLocation" TEXT NOT NULL,
    "pickupDate" TIMESTAMP(3) NOT NULL,
    "dropoffDate" TIMESTAMP(3) NOT NULL,
    "passengers" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "CarHireBooking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "id" SERIAL NOT NULL,
    "bookingId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "age" INTEGER,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_bookingCode_key" ON "Booking"("bookingCode");

-- CreateIndex
CREATE UNIQUE INDEX "SafariBooking_bookingId_key" ON "SafariBooking"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "FlightBooking_bookingId_key" ON "FlightBooking"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "HotelBooking_bookingId_key" ON "HotelBooking"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "CarHireBooking_bookingId_key" ON "CarHireBooking"("bookingId");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafariBooking" ADD CONSTRAINT "SafariBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FlightBooking" ADD CONSTRAINT "FlightBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HotelBooking" ADD CONSTRAINT "HotelBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarHireBooking" ADD CONSTRAINT "CarHireBooking_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Passenger" ADD CONSTRAINT "Passenger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
