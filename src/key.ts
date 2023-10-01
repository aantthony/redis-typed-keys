import { RedisAdapter, RedisArg, RedisReply } from './adapter';
import { RedisPromise } from './promise';

export type RedisType = 'none' | 'string' | 'list' | 'set' | 'zset' | 'hash';

const selectFirst = <T>(replies: RedisReply[]) => replies[0] as T;

export class RedisKey {
  constructor(
    public readonly adapter: RedisAdapter,
    public readonly key: string,
  ) {}

  op<RawReply extends RedisReply, Returned = RawReply>(
    op: string,
    args: RedisArg[],
    transformReply?: (res: RawReply) => Returned,
  ) {
    if (!this.adapter || !this.key) {
      throw new Error('RedisKey not initialized');
    }
    const replyFn = transformReply;
    return new RedisPromise<Returned>(
      this.adapter,
      [[op, this.key, ...args]],
      replyFn ? replies => replyFn(replies[0] as RawReply) : selectFirst,
    );
  }

  expire(seconds: number) {
    return this.op<number>('EXPIRE', [seconds.toString()]);
  }
  expireat(timestamp: number) {
    return this.op<number>('EXPIREAT', [timestamp.toString()]);
  }
  persist() {
    return this.op<number>('PERSIST', []);
  }
  pexpire(milliseconds: number) {
    return this.op<number>('PEXPIRE', [milliseconds.toString()]);
  }
  pexpireat(timestamp: number) {
    return this.op<number>('PEXPIREAT', [timestamp.toString()]);
  }
  pttl() {
    return this.op<number>('PTTL', []);
  }
  ttl() {
    return this.op<number>('TTL', []);
  }
  type() {
    return this.op<RedisType>('TYPE', []);
  }
  del() {
    return this.op<number>('DEL', []);
  }
  dump() {
    return this.op<string>('DUMP', []);
  }
  exists() {
    return this.op<number>('EXISTS', []);
  }
  rename(newKey: RedisKey) {
    return this.op<string>('RENAME', [newKey.key]);
  }
  renamenx(newKey: RedisKey) {
    return this.op<number>('RENAMENX', [newKey.key]);
  }
}
