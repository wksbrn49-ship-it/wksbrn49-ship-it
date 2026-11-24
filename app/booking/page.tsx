import { notFound } from "next/navigation";
import BookingRequestForm, {
  type BookingRequestConfig,
} from "@/app/components/BookingRequestForm";
import { flights } from "@/app/data/flights";
import { airbnbStays, hotels } from "@/app/data/hotels";
import safaris from "@/app/data/safaris";

type BookingPageProps = {
  searchParams: Promise<{
    departureDate?: string;
    endDate?: string;
    guests?: string;
    id?: string;
    startDate?: string;
    type?: string;
  }>;
};

function parsePrice(value: string) {
  return Number(value.replace(/[^\d.]/g, ""));
}

export default async function BookingPage({
  searchParams,
}: BookingPageProps) {
  const { departureDate, endDate, guests, id, startDate, type } =
    await searchParams;
  const itemId = Number(id);
  const initialGuests = Number(guests);
  const bookingDefaults = {
    initialStartDate: startDate ?? departureDate,
    initialEndDate: endDate,
    initialGuests:
      Number.isInteger(initialGuests) && initialGuests > 0
        ? initialGuests
        : undefined,
  };

  if (!Number.isInteger(itemId) || itemId < 1) {
    notFound();
  }

  let booking: BookingRequestConfig | undefined;

  if (type === "SAFARI") {
    const safari = safaris.find((item) => item.id === itemId);
    if (safari) {
      booking = {
        type: "SAFARI",
        name: safari.title,
        location: safari.location,
        price: parsePrice(safari.price),
        currency: "USD",
        ...bookingDefaults,
      };
    }
  } else if (type === "HOTEL") {
    const stay = [...hotels, ...airbnbStays].find((item) => item.id === itemId);
    if (stay) {
      booking = {
        type: "HOTEL",
        name: stay.name,
        location: stay.location,
        price: parsePrice(stay.price),
        currency: "USD",
        ...bookingDefaults,
      };
    }
  } else if (type === "FLIGHT") {
    const flight = flights.find((item) => item.id === itemId);
    if (flight) {
      booking = {
        type: "FLIGHT",
        name: flight.airline,
        location: flight.route,
        route: flight.route,
        price: parsePrice(flight.price),
        currency: "USD",
        ...bookingDefaults,
      };
    }
  }

  if (!booking) {
    notFound();
  }

  return <BookingRequestForm booking={booking} />;
}