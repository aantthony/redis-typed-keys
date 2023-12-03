import type { RedisAdapter } from './adapter';
import type { AllStrings } from './common-types';
import { RedisKey } from './key';
import { RedisHash } from './redis-hash';
import { RedisList } from './redis-list';
import { RedisScript } from './redis-script';
import { RedisSet } from './redis-set';
import { RedisSorted } from './redis-sorted';
import { RedisStream } from './redis-stream';
import { RedisString } from './redis-string';
import type { RedisValue } from './serialize';

export type RedisAdapterFactory = () => Promise<RedisAdapter> | RedisAdapter;

function createLazyAdapter(adapterFactory: RedisAdapterFactory): RedisAdapter {
  let adapterPromise: Promise<RedisAdapter> | RedisAdapter | null = null;

  function getAdapter(): Promise<RedisAdapter> | RedisAdapter {
    if (adapterPromise === null) {
      adapterPromise = adapterFactory();
    }
    return adapterPromise;
  }

  return {
    async send(commands, opts) {
      const adapter = await getAdapter();
      return adapter.send(commands, opts);
    },
  };
}

export class Schema {
  adapter: RedisAdapter;
  constructor(
    adapter: RedisAdapter | RedisAdapterFactory,
    public readonly prefix = '',
  ) {
    if (typeof adapter === 'function') {
      this.adapter = createLazyAdapter(adapter);
    } else {
      this.adapter = adapter;
    }
  }
  /**
   * Generic untyped key
   */
  key(name: string): RedisKey {
    return new RedisKey(this.adapter, name);
  }
  resolve(name: string): string {
    return `${this.prefix}${name}`;
  }
  hash<T extends AllStrings<T> = Record<string, string>>(
    name: string,
  ): RedisHash<T> {
    return new RedisHash(this.adapter, this.resolve(name));
  }
  list<T extends string>(name: string): RedisList<T> {
    return new RedisList(this.adapter, this.resolve(name));
  }
  script<Keys extends RedisKey[], Args extends RedisValue[]>(
    source: string,
  ): RedisScript<Keys, Args> {
    return new RedisScript(source);
  }
  set<T extends string>(name: string): RedisSet<T> {
    return new RedisSet(this.adapter, this.resolve(name));
  }
  sortedSet<T extends string>(name: string): RedisSorted<T> {
    return new RedisSorted(this.adapter, this.resolve(name));
  }
  stream<T extends AllStrings<T>>(name: string): RedisStream<T> {
    return new RedisStream(this.adapter, this.resolve(name));
  }
  string<T extends string>(name: string): RedisString<T> {
    return new RedisString(this.adapter, this.resolve(name));
  }
  int(name: string): RedisString<`${number}`> {
    return new RedisString(this.adapter, this.resolve(name));
  }
  path(...prefix: string[]): Schema {
    return new Schema(this.adapter, `${this.prefix}${prefix.join(':')}:`);
  }
}
