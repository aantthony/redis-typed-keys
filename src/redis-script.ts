import { RedisArg } from './adapter';
import { RedisKey } from './key';
import { RedisPromise } from './promise';
import { RedisValue, serialize } from './serialize';

export class RedisScript<Keys extends RedisKey[], Args extends RedisValue[]> {
  constructor(public readonly source: string) {}
  eval(keys: Keys, args: Args) {
    // use the server based on the first key
    const firstKey = keys[0];
    if (!firstKey) throw new Error('no keys provided to eval');

    return new RedisPromise(
      firstKey.adapter,
      [
        [
          'EVAL',
          this.source,
          keys.length.toString(),
          ...keys.map(k => k.key),
          ...args.map(serialize),
        ],
      ],
      res => {
        console.log('eval res', res);
      },
    );
  }
}
