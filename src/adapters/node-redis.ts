import { RedisAdapter, RedisErrorReply, RedisReply } from '../adapter';

export function createNodeRedisAdapter(params: {
  client: any;
  ErrorReply: any;
}): RedisAdapter {
  const transformReply = (res: unknown): RedisReply => {
    if (res instanceof params.ErrorReply) {
      return { error: (res as any).message } as RedisErrorReply;
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
