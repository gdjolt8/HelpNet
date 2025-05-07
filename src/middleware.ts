import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getToken } from "@/lib/functions"; // Secure function to validate token

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();

  // Get the token from cookies
  const token = req.cookies.get("authorization")?.value;

  // If no token exists, redirect to login
  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  

  // Validate token and check user status
  try {
    const userData = await getToken(token);

    if (!userData.ok) {
      // Invalid token, redirect to login
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (userData.account.banned) {
      // User is banned, redirect to banned page
      url.pathname = "/banned";
      return NextResponse.redirect(url);
    } else if (userData.account.banned != true && url.pathname == "/banned") {
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    url.pathname = "/login"; // Redirect to login on error
    return NextResponse.redirect(url);
  }

  return NextResponse.next(); // Allow request to continue if valid
}

export const config = {
  matcher: ['/home', '/posts/:id'],
}