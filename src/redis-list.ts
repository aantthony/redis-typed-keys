import { RedisKey } from './key';

export class RedisList<T extends string> extends RedisKey {
  lpush(entries: T[]) {
    return this.op<number>('LPUSH', entries);
  }
  rpush(entries: T[]) {
    return this.op<number>('RPUSH' as `L${string}`, entries);
  }
  lrange(start: number | undefined, stop: number | undefined) {
    return this.op<T[]>('LRANGE', [start ? start.toString() : '0', stop ? stop.toString() : '-1']);
  }
}
