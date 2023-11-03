import type { RedisArg } from './adapter';
import type { AllStrings, KeyValuePair } from './common-types';
import { decodeFieldValues } from './decode-field-values';
import { RedisKey } from './key';
import { RedisPromise } from './promise';

export class RedisHash<
  T extends AllStrings<T> = Record<string, string>,
> extends RedisKey {
  hgetall(): RedisPromise<T> {
    return this.op<string[], T>('hgetall', [], decodeFieldValues);
  }

  hget<K extends keyof T>(field: K): RedisPromise<T[K] | null> {
    return this.op('hget', [field as string]);
  }

  hmget<Fields extends (keyof T)[]>(
    ...fields: Fields
  ): RedisPromise<Pick<T, Fields[number]>> {
    return this.op<string[], Pick<T, Fields[number]>>(
      'hmget',
      fields as string[],
      decodeFieldValues as (res: string[]) => Pick<T, Fields[number]>,
    );
  }

  hincrby<K extends keyof T>(
    field: K,
    increment: number,
  ): RedisPromise<number> {
    return this.op('hincrby', [field as string, increment.toString()]);
  }

  hkeys(): RedisPromise<(keyof T)[]> {
    return this.op('hkeys', []);
  }

  hset(obj: Partial<T>): RedisPromise<'OK'> {
    const args: RedisArg[] = [];
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) args.push(k, v as string);
    }
    if (!args.length) return new RedisPromise(this.adapter, [], () => 'OK');
    return this.op('hset', args);
  }

  hdel<K extends keyof T>(...fields: K[]): RedisPromise<number> {
    return this.op('hdel', fields as string[]);
  }

  hsetnx<K extends keyof T>(field: K, value: T[K]): RedisPromise<number> {
    return this.op('hsetnx', [field as string, value]);
  }

  hlen(): RedisPromise<number> {
    return this.op('hlen', []);
  }

  hscan(options: {
    cursor?: string;
    match?: string;
    count?: number;
  }): RedisPromise<[cursor: string, results: KeyValuePair<T>[]]> {
    const args: RedisArg[] = [];
    args.push(options.cursor ?? '0');
    if (options.match) {
      args.push('MATCH', options.match);
    }
    if (options.count) {
      args.push('COUNT', options.count.toString());
    }

    return this.op<
      [string, string[]],
      [cursor: string, results: KeyValuePair<T>[]]
    >('HSCAN', args, (reply) => {
      const [cursor, flat] = reply;
      const pairs: KeyValuePair<T>[] = [];

      for (let i = 0; i < flat.length; i += 2) {
        pairs.push([flat[i], flat[i + 1]] as KeyValuePair<T>);
      }

      return [cursor, pairs];
    });
  }
}
