import { RedisKey } from './key';
import type { RedisPromise } from './promise';

export class RedisSet<T extends string> extends RedisKey {
  sadd(entries: T[]): RedisPromise<number> {
    return this.op('SADD', entries);
  }
  smembers(): RedisPromise<T[]> {
    return this.op('SMEMBERS', []);
  }
}
