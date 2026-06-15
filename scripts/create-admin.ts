#!/usr/bin/env node

/**
 * Bootstrap script to create or update admin user
 * Usage: npx ts-node scripts/create-admin.ts
 * 
 * Creates an admin user for local development with:
 * - Email: raghavaboyi@gmail.com
 * - Role: admin
 */

import { prisma } from '@/lib/prisma'

async function main() {
  const ADMIN_EMAIL = 'raghavaboyi@gmail.com'
  const ADMIN_NAME = 'Admin User'

  console.log('[AdminBootstrap] Starting admin user creation...')
  console.log(`[AdminBootstrap] Target email: ${ADMIN_EMAIL}`)

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: ADMIN_EMAIL },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    if (existingUser) {
      console.log('[AdminBootstrap] ✅ User already exists:', {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        role: existingUser.role,
        createdAt: existingUser.createdAt,
      })

      // Check if already admin
      if (existingUser.role === 'admin') {
        console.log('[AdminBootstrap] ✅ User is already admin, no changes needed')
        return
      }

      // Upgrade to admin
      console.log('[AdminBootstrap] Upgrading user to admin...')
      const updated = await prisma.user.update({
        where: { email: ADMIN_EMAIL },
        data: { role: 'admin' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          updatedAt: true,
        },
      })

      console.log('[AdminBootstrap] ✅ User upgraded to admin:', updated)
      return
    }

    // Create new admin user
    console.log('[AdminBootstrap] Creating new admin user...')
    const newUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: 'admin',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    console.log('[AdminBootstrap] ✅ Admin user created successfully:', newUser)
  } catch (error) {
    console.error('[AdminBootstrap] ❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .then(() => {
    console.log('[AdminBootstrap] ✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('[AdminBootstrap] ❌ Script failed:', error)
    process.exit(1)
  })
