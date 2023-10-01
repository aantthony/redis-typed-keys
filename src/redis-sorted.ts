import { RedisArg } from './adapter';
import { RedisKey } from './key';

export interface ZMember<K extends string> {
  score: number;
  member: K;
}

export interface ZRangeOptions {
  start?: number | undefined;
  stop?: number | undefined;
  by?: 'SCORE' | 'LEX';
  reverse?: boolean;
  limit?: { offset: number; count: number };
}

export class RedisSorted<K extends string = string> extends RedisKey {
  zadd(
    flags: ('NX' | 'XX' | 'GT' | 'LT' | 'CH' | 'INCR')[],
    entries: Readonly<Readonly<ZMember<K>>[]>,
  ) {
    if (!entries.length) {
      throw new Error('no entries');
    }
    const args: RedisArg[] = [...flags];
    for (const { score, member } of entries) {
      args.push(score.toString(), member);
    }
    return this.op<number>('ZADD', args);
  }
  zrange(options: ZRangeOptions) {
    const args: RedisArg[] = [];

    args.push(options.start == undefined ? '-inf' : options.start.toString());
    args.push(options.stop == undefined ? '+inf' : options.stop.toString());

    if (options.by) {
      args.push(`BY${options.by}`);
    }

    if (options.reverse) {
      args.push('REV');
    }

    if (options.limit) {
      args.push(
        'LIMIT',
        options.limit.offset.toString(),
        options.limit.count.toString(),
      );
    }

    return this.op<K[]>('ZRANGE', args);
  }
  zlexcount(
    options: {
      min?: string;
      max?: string;
    } = {},
  ) {
    const args: RedisArg[] = [];

    args.push(options.min == undefined ? '-' : options.min.toString());
    args.push(options.max == undefined ? '+' : options.max.toString());

    return this.op<number>('ZLEXCOUNT', args);
  }

  zrangeWithScores(options: ZRangeOptions) {
    const args: RedisArg[] = [];

    if (options.by === 'SCORE') {
      // by score
      args.push(options.start == null ? '-inf' : options.start.toString());
      args.push(options.stop == null ? '+inf' : options.stop.toString());
    } else if (options.by === 'LEX') {
      // by the member name (all same score)
      args.push(options.start == null ? '-' : options.start.toString());
      args.push(options.stop == null ? '+' : options.stop.toString());
    } else {
      // by the rank in the sorted set (0 for first, -1 for last)
      args.push(options.start == null ? '0' : options.start.toString());
      args.push(options.stop == null ? '-1' : options.stop.toString());
    }

    if (options.by) {
      args.push(`BY${options.by}`);
    }

    if (options.reverse) {
      args.push('REV');
    }

    if (options.limit) {
      args.push(
        'LIMIT',
        options.limit.offset.toString(),
        options.limit.count.toString(),
      );
    }

    args.push('WITHSCORES');

    return this.op<string[], ZMember<K>[]>('ZRANGE', args, res => {
      const out: ZMember<K>[] = [];

      for (let i = 0; i < res.length; i += 2) {
        out.push({
          score: parseFloat(res[i + 1]),
          member: res[i] as K,
        });
      }

      return out;
    });
  }
  zscore(member: K) {
    return this.op<number | null>('ZSCORE', [member]);
  }
}
