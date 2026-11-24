
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "wema_admin_session";
const SESSION_DURATION = 60 * 60 * 8;

function getSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET is missing or too short.");
  }

  return new TextEncoder().encode(secret);
}

export async function createAdminSession(adminId: number) {
  const token = await new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(adminId))
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());

  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (payload.role !== "admin" || !payload.sub) {
      return null;
    }

    const adminId = Number(payload.sub);

    if (!Number.isSafeInteger(adminId) || adminId <= 0) {
      return null;
    }

    return { adminId };
  } catch {
    return null;
  }
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });
}
