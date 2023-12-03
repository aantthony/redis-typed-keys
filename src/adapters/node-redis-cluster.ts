import type { createCluster, ErrorReply } from '@redis/client';
import type { RedisAdapter, RedisReply } from '../adapter';

export function createNodeRedisClusterAdapter(params: {
  cluster: ReturnType<typeof createCluster>;
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
      const pipeline = params.cluster.multi();

      for (const cmd of commands) {
        pipeline.addCommand(cmd.firstKey, cmd.args, transformReply);
      }

      if (opts.multi) {
        // Perhaps we should assert the the keys are all in the same slot?
        return pipeline.exec(false);
      }

      const res = await pipeline.execAsPipeline();
      return res;
    },
  };
}
