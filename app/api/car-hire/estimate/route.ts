import { NextResponse } from "next/server";

type RouteRequest = {
  origin?: unknown;
  destination?: unknown;
};

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps routing is not configured. Enter the distance and duration manually." },
      { status: 503 }
    );
  }

  let body: RouteRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "A valid pickup and destination are required." },
      { status: 400 }
    );
  }

  if (
    typeof body.origin !== "string" ||
    !body.origin.trim() ||
    body.origin.length > 200 ||
    typeof body.destination !== "string" ||
    !body.destination.trim() ||
    body.destination.length > 200
  ) {
    return NextResponse.json(
      { error: "A valid pickup and destination are required." },
      { status: 400 }
    );
  }

  let response: Response;
  try {
    response = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: { address: body.origin.trim() },
          destination: { address: body.destination.trim() },
          travelMode: "DRIVE",
          routingPreference: "TRAFFIC_AWARE",
          computeAlternativeRoutes: false,
          languageCode: "en-KE",
          units: "METRIC",
        }),
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Google Maps could not calculate this route. Enter the distance and duration manually." },
      { status: 502 }
    );
  }

  if (!response.ok) {
    return NextResponse.json(
      { error: "Google Maps could not calculate this route. Check the locations or enter the distance and duration manually." },
      { status: 502 }
    );
  }

  let result: {
    routes?: Array<{ distanceMeters?: number; duration?: string }>;
  };
  try {
    result = await response.json();
  } catch {
    return NextResponse.json(
      { error: "Google Maps returned an invalid route estimate." },
      { status: 502 }
    );
  }
  const route = result.routes?.[0];
  const distanceKm =
    typeof route?.distanceMeters === "number"
      ? route.distanceMeters / 1000
      : null;
  const durationSeconds =
    typeof route?.duration === "string"
      ? Number.parseFloat(route.duration.replace(/s$/, ""))
      : Number.NaN;

  if (
    distanceKm === null ||
    !Number.isFinite(distanceKm) ||
    !Number.isFinite(durationSeconds) ||
    distanceKm <= 0 ||
    durationSeconds <= 0
  ) {
    return NextResponse.json(
      { error: "No drivable route was found. Enter the distance and duration manually." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    distanceKm: Math.round(distanceKm * 10) / 10,
    durationMinutes: Math.ceil(durationSeconds / 60),
  });
}
