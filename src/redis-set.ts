import { RedisKey } from './key';
import type { RedisPromise } from './promise';

export class RedisSet<T extends string> extends RedisKey {
  sadd(entries: T[]): RedisPromise<number> {
    return this.op('SADD', entries);
  }
  smembers(): RedisPromise<T[]> {
    return this.op('SMEMBERS', []);
  }
  sismember(entry: T): RedisPromise<boolean> {
    return this.op('SISMEMBER', [entry]);
  }
  scard(): RedisPromise<number> {
    return this.op('SCARD', []);
  }
  spop(count?: number): RedisPromise<T | null> {
    return this.op('SPOP', count ? [count.toString()] : []);
  }
  srandmember(count?: number): RedisPromise<T | null> {
    return this.op('SRANDMEMBER', count ? [count.toString()] : []);
  }
  srem(entries: T[]): RedisPromise<number> {
    return this.op('SREM', entries);
  }
}
