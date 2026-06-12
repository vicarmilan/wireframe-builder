import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
  '/no-access',
  '/sso-callback(.*)',
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

const isPortalRoute = createRouteMatcher([
  '/portal(.*)',
  '/api/portal(.*)',
])

export default clerkMiddleware(async (auth, request) => {
  if (isPublicRoute(request)) return

  const { userId } = await auth.protect()

  const clerk = await clerkClient()
  const user = await clerk.users.getUser(userId)
  const role = (user.publicMetadata as Record<string, string>)?.role ?? 'client'

  // Clients trying to access admin routes → redirect to portal
  if (isAdminRoute(request) && role !== 'admin') {
    return NextResponse.redirect(new URL('/portal', request.url))
  }

  // Non-clients/non-admins trying to access portal → redirect to dashboard
  if (isPortalRoute(request) && role === 'admin') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/__clerk/:path*',
    '/(api|trpc)(.*)',
  ],
}
