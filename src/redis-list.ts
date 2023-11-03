import { RedisKey } from './key';
import type { RedisPromise } from './promise';

export class RedisList<T extends string> extends RedisKey {
  lpush(entries: T[]): RedisPromise<number> {
    return this.op('LPUSH', entries);
  }
  rpush(entries: T[]): RedisPromise<number> {
    return this.op('RPUSH' as `L${string}`, entries);
  }
  lrange(
    start: number | undefined,
    stop: number | undefined,
  ): RedisPromise<T[]> {
    return this.op('LRANGE', [
      start ? start.toString() : '0',
      stop ? stop.toString() : '-1',
    ]);
  }
}
