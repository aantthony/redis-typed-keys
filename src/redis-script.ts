import type { RedisKey } from './key';
import { RedisPromise } from './promise';
import type { RedisValue } from './serialize';
import { serialize } from './serialize';

export class RedisScript<Keys extends RedisKey[], Args extends RedisValue[]> {
  constructor(public readonly source: string) {}
  eval<T>(keys: Keys, args: Args): RedisPromise<T> {
    // use the server based on the first key
    const firstKey = keys.at(0);
    if (!firstKey) throw new Error('no keys provided to eval');

    return new RedisPromise(firstKey.adapter, [
      [
        'EVAL',
        this.source,
        keys.length.toString(),
        ...keys.map((k) => k.key),
        ...args.map(serialize),
      ],
    ]);
  }
}
