import type { RedisAdapter } from '../adapter';
import { createUpstashAdapter } from './upstash';

export function createVercelKvAdapter(
  config: { url?: string; token?: string } = {},
): RedisAdapter {
  return createUpstashAdapter({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
    ...config,
  });
}
