import { RedisArg } from './adapter';
import { AllStrings, KeyValuePair } from './common-types';
import { decodeFieldValues } from './decode-field-values';
import { RedisKey } from './key';

export class RedisHash<
  T extends AllStrings<T> = Record<string, string>,
> extends RedisKey {
  hgetall() {
    return this.op<string[], T>('hgetall', [], decodeFieldValues);
  }

  hget<K extends keyof T>(field: K) {
    return this.op<T[K] | null>('hget', [field as string]);
  }

  hmget<Fields extends (keyof T)[]>(...fields: Fields) {
    return this.op<string[], Pick<T, Fields[number]>>(
      'hmget',
      fields as string[],
      decodeFieldValues as (res: string[]) => Pick<T, Fields[number]>,
    );
  }

  hincrby<K extends keyof T>(field: K, increment: number) {
    return this.op<number, number>('hincrby', [
      field as string,
      increment.toString(),
    ]);
  }

  hset(obj: Partial<T>) {
    const args: RedisArg[] = [];
    for (const [k, v] of Object.entries(obj)) {
      if (v !== undefined) args.push(k, v as string);
    }
    return this.op<'OK'>('hset', args);
  }

  hdel<K extends keyof T>(...fields: K[]) {
    return this.op<number, number>('hdel', fields as string[]);
  }

  hsetnx<K extends keyof T>(field: K, value: T[K]) {
    return this.op<number, number>('hsetnx', [field as string, value]);
  }

  hlen() {
    return this.op<number>('hlen', []);
  }

  hscan(options: { cursor?: string; match?: string; count?: number }) {
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
    >('HSCAN', args, reply => {
      const [cursor, flat] = reply;
      const pairs: KeyValuePair<T>[] = [];

      for (let i = 0; i < flat.length; i += 2) {
        pairs.push([flat[i], flat[i + 1]] as KeyValuePair<T>);
      }

      return [cursor, pairs];
    });
  }
}
