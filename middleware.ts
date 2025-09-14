import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  // Handle preflight requests (OPTIONS) for automated scripts and dashboards
  if (request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 200 });
    preflight.headers.set("Access-Control-Allow-Origin", "*");
    preflight.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
    preflight.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
    preflight.headers.set("Access-Control-Allow-Credentials", "true");
    preflight.headers.set("Access-Control-Max-Age", "86400"); // Cache preflight for 24 hours
    return preflight;
  }

  // For all other requests - add CORS headers for external access
  const response = NextResponse.next();
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/health"
  ],
};
