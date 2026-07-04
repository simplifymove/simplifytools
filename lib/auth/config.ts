/**
 * NextAuth Configuration
 * Separate file to avoid route handler conflicts
 */

import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
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
        token.email = user.email // Explicitly preserve email from user
      }

      // Fetch user metadata from database on every JWT token call
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, name: true, email: true, image: true },
        })

        if (dbUser) {
          console.log('[NextAuth JWT] Found DB user:', { id: dbUser.id, email: dbUser.email })
          token.id = dbUser.id
          token.name = dbUser.name
          token.picture = dbUser.image
          token.email = dbUser.email // Ensure email is set
        }
      }

      console.log('[NextAuth JWT] Returning token with email:', token.email)
      return token
    },
    async session({ session, token }) {
      console.log('[NextAuth Session] Called with token.email:', token.email, 'token.id:', token.id)

      session.user = {
        ...session.user,
        id: typeof token.id === 'string' ? token.id : '',
        name: typeof token.name === 'string' ? token.name : session.user?.name ?? null,
        email: typeof token.email === 'string' ? token.email : session.user?.email ?? null,
        image: typeof token.picture === 'string' ? token.picture : session.user?.image ?? null,
      }

      console.log('[NextAuth Session] Returning session with email:', session.user?.email)
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}
