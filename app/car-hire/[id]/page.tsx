import { notFound, redirect } from "next/navigation";
import { cars } from "@/app/data/cars";

type CarBookingPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CarBookingPage({ params }: CarBookingPageProps) {
  const { id } = await params;
  const car = cars.find((item) => item.id === Number(id));

  if (!car) {
    notFound();
  }

  redirect(`/car-hire?carId=${car.id}`);
}
