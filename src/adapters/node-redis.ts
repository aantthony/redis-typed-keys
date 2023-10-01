import type { createClient, ErrorReply } from 'redis';
import { RedisAdapter, RedisErrorReply, RedisReply } from '../adapter';

type Client = ReturnType<typeof createClient>;

export function createNodeRedisAdapter(params: {
  client: Client;
  ErrorReply: typeof ErrorReply;
}): RedisAdapter {
  const transformReply = (res: unknown): RedisReply => {
    if (res instanceof params.ErrorReply) {
      return { error: res.message } as RedisErrorReply;
    }

    return res as RedisReply;
  };

  return {
    async send(commands, opts) {
      const pipeline = params.client.multi();

      for (const cmd of commands) {
        pipeline.addCommand(cmd, transformReply);
      }
      if (opts.multi) {
        return pipeline.exec(false);
      }

      const res = (await pipeline.execAsPipeline()) as RedisReply[];
      return res;
    },
  };
}
