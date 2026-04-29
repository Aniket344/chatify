import { NextResponse, type NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/chat") {
    return NextResponse.redirect(new URL("/chats", request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/chat"],
}
