import type { RedisAdapter, RedisErrorReply, RedisReply } from '../adapter';

interface UpstashReply {
  error?: string;
  result: string | number;
}

function transformReply(r: UpstashReply): RedisReply {
  if (r.error) return r as RedisErrorReply;
  return r.result;
}

export function createRestAdapater(config: {
  url?: string;
  token?: string;
}): RedisAdapter {
  if (!config.url) throw new Error('Missing url');
  if (!config.token) throw new Error('Missing token');

  const pipelineEndpoint = `${config.url}/pipeline`;
  const multiEndpoint = `${config.url}/multi-exec`;

  return {
    async send(commands, opts) {
      const isMulti = opts.multi;
      const res = await fetch(isMulti ? multiEndpoint : pipelineEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify(commands),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upstash error: ${text}`);
      }
      const json = (await res.json()) as UpstashReply[];
      return json.map(transformReply);
    },
  };
}
