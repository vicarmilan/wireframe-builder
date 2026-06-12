import { clerkMiddleware, createRouteMatcher, clerkClient } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/login(.*)',
  '/register(.*)',
  '/preview/(.*)',
  '/no-access',
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

  const { userId } = await auth.protect()

  if (isAdminRoute(request)) {
    const client = await clerkClient()
    const user = await client.users.getUser(userId)
    const role = (user.publicMetadata as Record<string, string>)?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/no-access', request.url))
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
