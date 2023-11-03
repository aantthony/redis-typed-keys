/* eslint-disable @typescript-eslint/unbound-method -- it doesnt use this for static methods */
import type { RedisAdapter, RedisArg, RedisReply } from './adapter';

export type InferCmdResponses<T extends unknown[]> = {
  [K in keyof T]: T[K] extends RedisPromise<infer TData> ? TData : never;
};

export class RedisPromise<Returned = unknown> implements Promise<Returned> {
  public constructor(
    private readonly adapter: RedisAdapter,
    private readonly commands: RedisArg[][],
    private readonly transformFn: (replies: RedisReply[]) => Returned = (
      value,
    ) => value as Returned,
  ) {}

  wantsMulti = false;

  [Symbol.toStringTag] = 'RedisPromise';

  private _promise: Promise<Returned> | null = null;

  private toPromise(): Promise<Returned> {
    if (this._promise === null) {
      this._promise = (
        this.commands.length
          ? this.adapter.send(this.commands, {
              multi: this.wantsMulti,
            })
          : Promise.resolve([])
      ).then((value) => {
        return this.transformFn(value);
      });
    }
    return this._promise;
  }

  then: Promise<Returned>['then'] = (onFullfilled, onRejected) => {
    return this.toPromise().then(onFullfilled, onRejected);
  };

  catch: Promise<Returned>['catch'] = (onRejected) => {
    return this.toPromise().catch(onRejected);
  };

  finally: Promise<Returned>['finally'] = (onFinally) => {
    return this.toPromise().finally(onFinally);
  };

  static pipeline<P extends (null | undefined | RedisPromise)[]>(
    promises: [...P],
  ): RedisPromise<InferCmdResponses<P>> {
    const first = promises.find((p) => Boolean(p));
    if (!first) {
      throw new Error('no promises provided to pipeline');
    }

    const adapter = first.adapter;
    const commands = promises.flatMap((p) => (p ? p.commands : []));

    const transform = (flatReplies: RedisReply[]): InferCmdResponses<P> => {
      let i = 0;

      return promises.map((p) => {
        if (!p) return undefined;

        const relevantReplies = flatReplies.slice(i, i + p.commands.length);
        i += p.commands.length;

        return p.transformFn(relevantReplies);
      }) as InferCmdResponses<P>;
    };

    return new RedisPromise(adapter, commands, transform);
  }

  static multi<P extends (null | undefined | RedisPromise)[]>(
    promises: [...P],
  ): RedisPromise<InferCmdResponses<P>> {
    const p = RedisPromise.pipeline(promises);
    p.wantsMulti = true;
    return p;
  }

  /**
   * Transform the result of this promise.
   * Does not execute the promise (use `then` for that)
   * @returns a new redis promise with the transformed result
   */
  transform<V>(fn: (res: Returned) => V): RedisPromise<V> {
    const originalTransform = this.transformFn;
    return new RedisPromise(this.adapter, this.commands, (value) => {
      return fn(originalTransform(value));
    });
  }
}

export const pipeline = RedisPromise.pipeline;
export const multi = RedisPromise.multi;
