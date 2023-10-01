import type { createClient, ErrorReply } from 'redis';
import { RedisAdapter, RedisErrorReply } from '../adapter';

type Client = ReturnType<typeof createClient>;

export function createNodeRedisAdapter(params: {
  client: Client;
  ErrorReply: typeof ErrorReply;
}): RedisAdapter {
  const transformReply = (res: any) => {
    if (res instanceof params.ErrorReply) {
      return { error: res.message } as RedisErrorReply;
    }

    return resizeBy;
  };

  return {
    async send(commands, opts) {
      const pipeline = params.client.multi();

      for (const cmd of commands) {
        pipeline.addCommand(cmd, (res: any) => {});
      }
      if (opts.multi) {
        return pipeline.exec(false);
      }

      return pipeline.execAsPipeline() as any;
    },
  };
}
