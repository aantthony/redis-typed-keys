import type { Cmd, RedisAdapter, RedisArg, RedisReply } from './adapter';
import { RedisPromise } from './promise';

export type RedisType = 'none' | 'string' | 'list' | 'set' | 'zset' | 'hash';

const selectFirst = <T>(replies: RedisReply[]): T => replies[0] as T;

export class RedisKey {
  constructor(
    public readonly adapter: RedisAdapter,
    public readonly key: string,
  ) {}

  op<RawReply extends RedisReply, Returned = RawReply>(
    op: string,
    args: RedisArg[],
    transformReply?: (res: RawReply) => Returned,
  ): RedisPromise<Returned> {
    const replyFn = transformReply;
    const cmd: Cmd = {
      firstKey: this.key,
      args: [op, this.key, ...args],
    };
    return new RedisPromise<Returned>(
      this.adapter,
      [cmd],
      replyFn ? (replies) => replyFn(replies[0] as RawReply) : selectFirst,
    );
  }

  expire(seconds: number): RedisPromise<number> {
    return this.op('EXPIRE', [seconds.toString()]);
  }
  expireat(timestamp: number): RedisPromise<number> {
    return this.op('EXPIREAT', [timestamp.toString()]);
  }
  persist(): RedisPromise<number> {
    return this.op('PERSIST', []);
  }
  pexpire(milliseconds: number): RedisPromise<number> {
    return this.op('PEXPIRE', [milliseconds.toString()]);
  }
  pexpireat(timestamp: number): RedisPromise<number> {
    return this.op('PEXPIREAT', [timestamp.toString()]);
  }
  pttl(): RedisPromise<number> {
    return this.op('PTTL', []);
  }
  ttl(): RedisPromise<number> {
    return this.op('TTL', []);
  }
  type(): RedisPromise<RedisType> {
    return this.op('TYPE', []);
  }
  del(): RedisPromise<number> {
    return this.op('DEL', []);
  }
  dump(): RedisPromise<string> {
    return this.op('DUMP', []);
  }
  exists(): RedisPromise<number> {
    return this.op('EXISTS', []);
  }
  rename(newKey: RedisKey): RedisPromise<string> {
    return this.op('RENAME', [newKey.key]);
  }
  renamenx(newKey: RedisKey): RedisPromise<number> {
    return this.op('RENAMENX', [newKey.key]);
  }
}
