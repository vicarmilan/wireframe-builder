import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
  '/preview/(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/projects(.*)',
  '/admin(.*)',
  '/api/projects(.*)',
  '/api/pages(.*)',
  '/api/upload(.*)',
  '/api/admin(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return

  const { userId, sessionClaims } = await auth.protect()

  // Block clients from admin routes
  if (isAdminRoute(request)) {
    const role = (sessionClaims?.metadata as Record<string, string> | undefined)?.role
    if (role !== 'admin') {
      const url = new URL('/no-access', request.url)
      return NextResponse.redirect(url)
    }
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
}
