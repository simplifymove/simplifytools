import type { NextRequest } from 'next/server';
import Redis from 'ioredis';
import { createHash } from 'node:crypto';

const AI_WRITE_WINDOW_SECONDS = 60;

function configuredLimit(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isSafeInteger(value) && value > 0 ? value : fallback;
}

const AI_WRITE_PER_IP_LIMIT = configuredLimit('AI_WRITE_PER_IP_LIMIT', 10);
const AI_WRITE_GLOBAL_LIMIT = configuredLimit('AI_WRITE_GLOBAL_LIMIT', 25);

export const AI_WRITE_RATE_LIMIT_SCRIPT = `local perIp = tonumber(redis.call('GET', KEYS[1]) or '0')
     local global = tonumber(redis.call('GET', KEYS[2]) or '0')

     if perIp >= tonumber(ARGV[2]) or global >= tonumber(ARGV[3]) then
       local ttl1 = redis.call('TTL', KEYS[1])
       local ttl2 = redis.call('TTL', KEYS[2])
       local wait1 = perIp >= tonumber(ARGV[2]) and ttl1 or 0
       local wait2 = global >= tonumber(ARGV[3]) and ttl2 or 0
       return {0, math.max(1, wait1, wait2)}
     end

     local count1 = redis.call('INCR', KEYS[1])
     if count1 == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end

     local count2 = redis.call('INCR', KEYS[2])
     if count2 == 1 then redis.call('EXPIRE', KEYS[2], ARGV[1]) end

     return {1, 0}`;

let aiWriteRedis: Redis | null = null;
let aiWriteRedisConnectPromise: Promise<void> | null = null;

function getAiWriteRedis(): Redis {
  if (!aiWriteRedis) {
    aiWriteRedis = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy: (times: number) => Math.min(times * 200, 2000),
    });

    aiWriteRedis.on('error', (error) => {
      console.error('[AI Write] Redis connection error:', error.message);
    });
  }

  return aiWriteRedis;
}

export async function enforceAiWriteRateLimit(request: NextRequest): Promise<{
  allowed: boolean;
  retryAfter: number;
}> {
  const redis = getAiWriteRedis();

  if (redis.status === 'wait') {
    if (!aiWriteRedisConnectPromise) {
      aiWriteRedisConnectPromise = redis.connect().finally(() => {
        aiWriteRedisConnectPromise = null;
      });
    }
    await aiWriteRedisConnectPromise;
  } else if (redis.status === 'connecting' && aiWriteRedisConnectPromise) {
    await aiWriteRedisConnectPromise;
  }

  const visitorId = createHash('sha256')
    .update(request.headers.get('x-real-ip')?.trim() || 'unknown')
    .digest('hex');

  const result = await redis.eval(
    AI_WRITE_RATE_LIMIT_SCRIPT,
    2,
    'rate-limit:ai-write:visitor:' + visitorId,
    'rate-limit:ai-write:global',
    AI_WRITE_WINDOW_SECONDS,
    AI_WRITE_PER_IP_LIMIT,
    AI_WRITE_GLOBAL_LIMIT
  ) as [number, number];

  return {
    allowed: Number(result[0]) === 1,
    retryAfter: Math.max(1, Number(result[1])),
  };
}
