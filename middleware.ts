import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME } from "@/lib/constants";

const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");

async function verify(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as Record<string, string>;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProductDetail = pathname.startsWith("/products/") && pathname !== "/products";
  const isCheckout = pathname.startsWith("/checkout");

  if (
    !pathname.startsWith("/dashboard") &&
    !pathname.startsWith("/admin") &&
    !isCheckout &&
    !isProductDetail
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("reason", "auth");
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verify(token);
    if (pathname.startsWith("/dashboard") && payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  } catch {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("reason", "auth");
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/checkout", "/products/:path*"],
};
