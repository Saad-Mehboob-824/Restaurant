import { NextResponse } from 'next/server'

// Middleware: only protect /Orders and require a token cookie to be present.
// Keep verification on the server (API route) because Edge runtime doesn't
// support Node's crypto module for JWT verification.
export async function middleware(request) {
  const path = request.nextUrl.pathname

  // Only protect /Orders route
  if (!path.startsWith('/Orders')) {
    return NextResponse.next()
  }

  const tokenCookie = request.cookies.get('token')

  if (!tokenCookie) {
    // Redirect to login if no token cookie is present
    return NextResponse.redirect(new URL('/84588878l00o00g00i00n76580982', request.url))
  }

  // Token exists — allow access. Full verification should happen in server APIs.
  return NextResponse.next()
}