import type { createClient, ErrorReply } from '@redis/client';
import type { RedisAdapter, RedisReply } from '../adapter';

export function createNodeRedisAdapter(params: {
  client: ReturnType<typeof createClient>;
  ErrorReply: typeof ErrorReply;
}): RedisAdapter {
  const transformReply = (res: unknown): RedisReply => {
    if (res instanceof params.ErrorReply) {
      return { error: res.message };
    }

    return res as RedisReply;
  };

  return {
    async send(commands, opts) {
      const pipeline = params.client.multi();

      for (const cmd of commands) {
        pipeline.addCommand(cmd.args, transformReply);
      }

      if (opts.multi) {
        return pipeline.exec(false);
      }

      const res = await pipeline.execAsPipeline();
      return res;
    },
  };
}
