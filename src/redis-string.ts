import type { RedisArg } from './adapter';
import { RedisKey } from './key';
import type { RedisPromise } from './promise';

export class RedisString<Value extends string = string> extends RedisKey {
  set(
    value: RedisArg,
    options?: {
      nx?: boolean;
      xx?: boolean;
      get?: boolean;
      ex?: number;
      px?: number;
      exat?: number;
      pxat?: number;
      keepttl?: boolean;
    },
  ): RedisPromise<Value | null> {
    const args: RedisArg[] = [value];
    if (options?.nx) {
      args.push('NX');
    } else if (options?.xx) {
      args.push('XX');
    }
    if (options?.get) {
      args.push('GET');
    }

    if (options?.ex) {
      args.push('EX', options.ex.toString());
    } else if (options?.px) {
      args.push('PX', options.px.toString());
    } else if (options?.exat) {
      args.push('EXAT', options.exat.toString());
    } else if (options?.pxat) {
      args.push('PXAT', options.pxat.toString());
    } else if (options?.keepttl) {
      args.push('KEEPTTL');
    }

    return this.op('SET', args);
  }
  get(): RedisPromise<Value | null> {
    return this.op('GET', []);
  }
  incr(): RedisPromise<number> {
    return this.op('INCR', []);
  }
  incrby(count: number): RedisPromise<number> {
    return this.op('INCRBY', [count.toString()]);
  }

  decr(): RedisPromise<number> {
    return this.op('DECR', []);
  }

  decrby(count: number): RedisPromise<number> {
    return this.op('DECRBY', [count.toString()]);
  }

  append(value: RedisArg): RedisPromise<number> {
    return this.op('APPEND', [value]);
  }

  strlen(): RedisPromise<number> {
    return this.op('STRLEN', []);
  }

  setrange(offset: number, value: RedisArg): RedisPromise<number> {
    return this.op('SETRANGE', [offset.toString(), value]);
  }

  getrange(start: number, end: number): RedisPromise<string> {
    return this.op('GETRANGE', [start.toString(), end.toString()]);
  }

  setbit(offset: number, value: RedisArg): RedisPromise<number> {
    return this.op('SETBIT', [offset.toString(), value]);
  }

  getbit(offset: number): RedisPromise<number> {
    return this.op('GETBIT', [offset.toString()]);
  }
}
