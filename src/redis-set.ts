import { RedisKey } from './key';

export class RedisSet<T extends string> extends RedisKey {
  sadd(entries: T[]) {
    return this.op<number>('SADD', entries);
  }
  smembers() {
    return this.op<T[]>('SMEMBERS', [], res => res);
  }
}
