import NextAuth, { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('[NextAuth signIn event] User signed in:', {
        userId: user.id,
        email: user.email,
        isNewUser,
      })
      // Update lastLoginAt when user signs in
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        })
        console.log('[NextAuth signIn event] Updated lastLoginAt for user:', user.id)
      } catch (error) {
        console.error('[NextAuth signIn event] Error updating lastLoginAt:', error)
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log('[NextAuth JWT] Called with user:', !!user, 'token.email:', token.email)
      
      if (user) {
        console.log('[NextAuth JWT] User object found:', {
          id: user.id,
          email: user.email,
          name: user.name,
        })
        token.id = user.id
      }

      // Fetch user metadata from database on every JWT token call
      if (token.email) {
        try {
          console.log('[NextAuth JWT] Querying database for email:', token.email)
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
          })

          if (dbUser) {
            console.log('[NextAuth JWT] Found user in DB:', {
              id: dbUser.id,
              email: dbUser.email,
              currentLastLoginAt: dbUser.lastLoginAt,
            })

            token.id = dbUser.id
            token.createdAt = dbUser.createdAt?.toISOString()
            token.lastLoginAt = dbUser.lastLoginAt?.toISOString()
            token.provider = dbUser.provider
            token.bio = dbUser.bio
          } else {
            console.log('[NextAuth JWT] User NOT found in database!')
          }
        } catch (error) {
          console.error('[NextAuth JWT] Error in jwt callback:', error)
        }
      }

      console.log('[NextAuth JWT] Returning token with lastLoginAt:', token.lastLoginAt)
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.createdAt = token.createdAt as string | undefined
        session.user.lastLoginAt = token.lastLoginAt as string | undefined
        session.user.provider = token.provider as string | undefined
        session.user.bio = token.bio as string | undefined
        console.log('[NextAuth Session] Returning session:', {
          createdAt: session.user.createdAt,
          lastLoginAt: session.user.lastLoginAt,
        })
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return `${baseUrl}/account`
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
