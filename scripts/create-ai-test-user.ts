/**
 * DEV-ONLY SCRIPT: Create AI Code Assistant Test User
 * 
 * This script creates a test user with:
 * - Active AI subscription
 * - API key (sca_live_ format)
 * - 1000 credits remaining
 * 
 * SECURITY: Only allow this script in development!
 * Do NOT expose as a public API endpoint.
 * 
 * Usage:
 *   npx ts-node scripts/create-ai-test-user.ts
 * 
 * Output: Prints the API key ONCE (never retrievable again)
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Only allow in development
if (process.env.NODE_ENV === 'production') {
  console.error('❌ ERROR: This script is DEV-ONLY. Cannot run in production.');
  process.exit(1);
}

const prisma = new PrismaClient();

async function createTestUser() {
  const testEmail = 'ai-test-' + Date.now() + '@simplifyconvert.dev';
  const testUserName = 'AI Test User ' + Date.now();

  console.log('🔧 Creating AI Code Assistant test user...\n');

  try {
    // Step 1: Find or create user
    let user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (!user) {
      console.log(`📝 Creating new user: ${testEmail}`);
      user = await prisma.user.create({
        data: {
          email: testEmail,
          name: testUserName,
          emailVerified: new Date(), // Mark as verified
        },
      });
      console.log(`✅ User created with ID: ${user.id}\n`);
    } else {
      console.log(`✅ User already exists: ${user.id}\n`);
    }

    // Step 2: Create or update AI subscription
    const subscription = await prisma.aiSubscription.upsert({
      where: { userId: user.id },
      update: {
        status: 'active',
        creditsRemaining: 1000,
        creditsUsed: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        monthlyCredits: 1000,
      },
      create: {
        userId: user.id,
        status: 'active',
        planName: 'test',
        monthlyCredits: 1000,
        creditsRemaining: 1000,
        creditsUsed: 0,
        startsAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
    });

    console.log('📋 AI Subscription:');
    console.log(`   Status: ${subscription.status}`);
    console.log(`   Credits: ${subscription.creditsRemaining}`);
    console.log(`   Expires: ${subscription.expiresAt?.toISOString()}\n`);

    // Step 3: Generate API key
    // Format: sca_live_<48-char-hex>
    const apiKeyRandom = crypto.randomBytes(24).toString('hex'); // 24 bytes = 48 hex chars
    const fullApiKey = `sca_live_${apiKeyRandom}`;
    const keyPrefix = fullApiKey.substring(0, 12); // "sca_live_" + 3 hex chars
    const keyLast4 = fullApiKey.substring(fullApiKey.length - 4); // Last 4 chars

    // Hash the key (SHA-256 for fast verification)
    const keyHash = crypto.createHash('sha256').update(fullApiKey).digest('hex');

    // Check if API key already exists for this user
    const existingKeys = await prisma.apiKey.findMany({
      where: { userId: user.id, isActive: true },
    });

    if (existingKeys.length > 0) {
      console.log(`⚠️  Active API key(s) already exist for this user.`);
      console.log(`   ID: ${existingKeys[0].id}`);
      console.log(`   Prefix: ${existingKeys[0].keyPrefix}...${existingKeys[0].keyLast4}`);
      console.log(`\n   To create a new one, deactivate existing keys first.\n`);
      
      console.log('💡 Tip: You can use the Dashboard to deactivate old keys.\n');
    }

    const apiKey = await prisma.apiKey.create({
      data: {
        userId: user.id,
        keyHash,
        keyPrefix,
        keyLast4,
        isActive: true,
      },
    });

    console.log('🔑 API Key Created:');
    console.log(`   ID: ${apiKey.id}`);
    console.log(`   Created: ${apiKey.createdAt.toISOString()}\n`);

    // Step 4: Print the key (ONLY ONCE)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🚀 YOUR TEST API KEY (SAVE THIS - YOU CANNOT SEE IT AGAIN):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n   ${fullApiKey}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Test user setup complete!\n');

    // Step 5: Print summary
    console.log('📊 Test User Summary:');
    console.log(`   Email: ${user.email}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Subscription: ${subscription.status} (${subscription.creditsRemaining} credits)`);
    console.log(`   API Key Prefix: ${keyPrefix}...${keyLast4}`);
    console.log(`   Valid Until: ${subscription.expiresAt?.toLocaleDateString()}\n`);

    console.log('🧪 Next steps for testing:');
    console.log('   1. Copy the API key above');
    console.log('   2. In VS Code extension: Ctrl+Shift+P → Set API Key');
    console.log('   3. Change apiBaseUrl to: http://localhost:3000');
    console.log('   4. Start the backend: npm run dev');
    console.log('   5. Test chat, explain, fix commands\n');

  } catch (error) {
    console.error('❌ Error creating test user:');
    if (error instanceof Error) {
      console.error(`   ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
createTestUser();
