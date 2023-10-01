import { AllStrings } from './common-types';
import { decodeFieldValues } from './decode-field-values';
import { RedisKey } from './key';
import { RedisPromise } from './promise';

export type StreamEntry<Params> = {
  id: string;

  t: Date;
  seq: number;

  params: Params;
};

export class RedisStream<T extends AllStrings<T>> extends RedisKey {
  /**
   * Add a new entry to the stream.
   * @link https://redis.io/commands/xadd
   */
  xadd(id: string | null, fields: T) {
    const args = [id || '*'];
    for (const [k, v] of Object.entries(fields)) {
      args.push(k, v as string);
    }
    return this.op<string>('XADD', args);
  }
  xrange(q: {
    start?: string;
    end?: string;
    count?: number;
    /**
     * If true, return entries in reverse order, by actually issuing XREVRANGE.
     */
    reverse?: boolean;
  }): RedisPromise<StreamEntry<T>[]> {
    const args = q.reverse
      ? [q.end ?? '+', q.start ?? '-']
      : [q.start ?? '-', q.end ?? '+'];
    if (q.count) args.push('COUNT', q.count.toString());
    const cmdName = q.reverse ? 'XREVRANGE' : 'XRANGE';
    return this.op(cmdName, args, (res: [id: string, fields: string[]][]) => {
      return res.map(([id, fields]): StreamEntry<T> => {
        const [sT, sSeq] = id.split('-');
        return {
          id,
          t: new Date(parseInt(sT)),
          seq: parseInt(sSeq),
          params: decodeFieldValues<T>(fields),
        };
      });
    });
  }
  xrevrange(q: {
    start: string;
    end: string;
    count?: number;
  }): RedisPromise<StreamEntry<T>[]> {
    return this.xrange({ ...q, reverse: true });
  }
}
