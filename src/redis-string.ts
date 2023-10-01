import { RedisArg } from './adapter';
import { RedisKey } from './key';

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
  ) {
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

    return this.op<Value | null>('SET', args);
  }
  get() {
    return this.op<Value | null>('GET', []);
  }
  incr() {
    return this.op<number>('INCR', []);
  }
  incrby(count: number) {
    return this.op<number>('INCRBY', [count.toString()]);
  }
}
