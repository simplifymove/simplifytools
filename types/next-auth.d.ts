import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & {
      id: string
      provider?: string
      bio?: string | null
      createdAt?: Date
      lastLoginAt?: Date
    }
  }

  interface User {
    provider?: string
    bio?: string | null
    createdAt?: Date
    lastLoginAt?: Date
  }
}
