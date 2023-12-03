import type { RedisAdapter } from '../adapter';
import { createRestAdapater } from './rest';

export function createUpstashAdapter(config: {
  url?: string;
  token?: string;
}): RedisAdapter {
  return createRestAdapater({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    ...config,
  });
}
