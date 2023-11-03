/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-explicit-any -- better than adding dependency for types */
import type { RedisAdapter, RedisErrorReply, RedisReply } from '../adapter';

export function createNodeRedisAdapter(params: {
  client: any;
  ErrorReply: any;
}): RedisAdapter {
  const transformReply = (res: unknown): RedisReply => {
    if (res instanceof params.ErrorReply) {
      return { error: (res as { message: string }).message } as RedisErrorReply;
    }

    return res as RedisReply;
  };

  return {
    async send(commands, opts): Promise<RedisReply[]> {
      const pipeline = params.client.multi();

      for (const cmd of commands) {
        pipeline.addCommand(cmd, transformReply);
      }
      if (opts.multi) {
        return pipeline.exec(false) as Promise<RedisReply[]>;
      }

      const res = (await pipeline.execAsPipeline()) as RedisReply[];
      return res;
    },
  };
}
