import { createUpstashAdapter } from './upstash';

export function createVercelKvAdapter(config: { url?: string; token?: string } = {}) {
  return createUpstashAdapter({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
    ...config,
  });
}
