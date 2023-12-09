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

  lpop(): RedisPromise<T | null> {
    return this.op('LPOP', []);
  }

  rpop(): RedisPromise<T | null> {
    return this.op('RPOP', []);
  }

  lindex(index: number): RedisPromise<T | null> {
    return this.op('LINDEX', [index.toString()]);
  }

  llen(): RedisPromise<number> {
    return this.op('LLEN', []);
  }

  lrem(count: number, value: T): RedisPromise<number> {
    return this.op('LREM', [count.toString(), value]);
  }

  lset(index: number, value: T): RedisPromise<'OK'> {
    return this.op('LSET', [index.toString(), value]);
  }

  ltrim(start: number, stop: number): RedisPromise<'OK'> {
    return this.op('LTRIM', [start.toString(), stop.toString()]);
  }
}
