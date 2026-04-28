import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      provider?: string
      bio?: string | null
      createdAt?: string
      lastLoginAt?: string
    }
  }

  interface User {
    provider?: string
    bio?: string | null
    createdAt?: Date
    lastLoginAt?: Date
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    provider?: string
    bio?: string | null
    createdAt?: string
    lastLoginAt?: string
  }
}
