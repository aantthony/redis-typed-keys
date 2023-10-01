import { RedisArg } from './adapter';
import { AllStrings } from './common-types';
import { decodeFieldValues } from './decode-field-values';
import { RedisKey } from './key';

export class RedisHash<T extends AllStrings<T> = Record<string, string>> extends RedisKey {
  hgetall() {
    return this.op<string[], T>('hgetall', [], decodeFieldValues);
  }

  hget<K extends keyof T>(field: K) {
    return this.op<T[K] | null>('hget', [field as string]);
  }

  hmget<K extends keyof T>(...fields: K[]) {
    return this.op<
      string[],
      {
        [K in keyof K]: K extends keyof T ? T[K] : never;
      }
    >('hmget', fields as string[], decodeFieldValues);
  }

  hincrby<K extends keyof T>(field: K, increment: number) {
    return this.op<number, number>('hincrby', [field as string, increment.toString()]);
  }

  hset(obj: Partial<T>) {
    const args: RedisArg[] = [];
    for (const [k, v] of Object.entries(obj)) {
      if (v) args.push(k, v as string);
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
}
