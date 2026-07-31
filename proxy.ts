import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getAiStudioAuthenticationRedirect } from '@/lib/auth/redirect'

export async function proxy(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  })

  const isAuth = !!token
  const aiStudioRedirect = getAiStudioAuthenticationRedirect(
    req.nextUrl.pathname,
    isAuth,
    req.nextUrl.search,
  )

  if (aiStudioRedirect) {
    return NextResponse.redirect(new URL(aiStudioRedirect, req.url))
  }

  // Protect /account route
  if (req.nextUrl.pathname.startsWith('/account') && !isAuth) {
    const signInUrl = new URL('/auth/signin', req.url)
    signInUrl.searchParams.set('callbackUrl', '/account')
    return NextResponse.redirect(signInUrl)
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-pathname', req.nextUrl.pathname)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    '/account',
    '/account/:path*',
    '/admin',
    '/admin/:path*',
    '/ai-studio',
    '/ai-studio/:path*',
  ],
}
