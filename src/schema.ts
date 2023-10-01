import { RedisAdapter } from './adapter';
import { AllStrings } from './common-types';
import { RedisKey } from './key';
import { RedisHash } from './redis-hash';
import { RedisList } from './redis-list';
import { RedisScript } from './redis-script';
import { RedisSet } from './redis-set';
import { RedisSorted } from './redis-sorted';
import { RedisStream } from './redis-stream';
import { RedisString } from './redis-string';
import { RedisValue } from './serialize';

export class Schema {
  constructor(
    public readonly adapter: RedisAdapter,
    public readonly prefix: string = '',
  ) {}
  /**
   * Generic untyped key
   */
  key(name: string) {
    return new RedisKey(this.adapter, name);
  }
  resolve(name: string) {
    return `${this.prefix}${name}`;
  }
  hash<T extends AllStrings<T> = Record<string, string>>(name: string) {
    return new RedisHash<T>(this.adapter, this.resolve(name));
  }
  list<T extends string>(name: string) {
    return new RedisList<T>(this.adapter, this.resolve(name));
  }
  script<Keys extends RedisKey[], Args extends RedisValue[]>(source: string) {
    return new RedisScript<Keys, Args>(source);
  }
  set<T extends string>(name: string) {
    return new RedisSet<T>(this.adapter, this.resolve(name));
  }
  sortedSet<T extends string>(name: string) {
    return new RedisSorted<T>(this.adapter, this.resolve(name));
  }
  stream<T extends AllStrings<T>>(name: string) {
    return new RedisStream<T>(this.adapter, this.resolve(name));
  }
  string<T extends string>(name: string) {
    return new RedisString<T>(this.adapter, this.resolve(name));
  }
  int(name: string) {
    return new RedisString<`${number}`>(this.adapter, this.resolve(name));
  }
  path(...prefix: string[]): Schema {
    return new Schema(this.adapter, `${this.prefix}${prefix.join(':')}:`);
  }
}
