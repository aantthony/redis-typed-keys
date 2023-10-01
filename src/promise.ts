import { RedisAdapter, RedisArg, RedisReply } from './adapter';

export type InferCmdResponses<T extends unknown[]> = {
  [K in keyof T]: T[K] extends RedisPromise<infer TData> ? TData : void;
};

export class RedisPromise<Returned = unknown> implements Promise<Returned> {
  public constructor(
    private readonly adapter: RedisAdapter,
    private readonly commands: RedisArg[][],
    private readonly transform: (replies: RedisReply[]) => Returned = value => value as Returned,
  ) {}

  wantsMulti = false;

  [Symbol.toStringTag] = 'RedisPromise';

  private _promise: Promise<Returned> | null = null;

  private toPromise(): Promise<Returned> {
    if (this._promise === null) {
      this._promise = this.adapter
        .send(this.commands, {
          multi: this.wantsMulti,
        })
        .then(value => {
          return this.transform(value);
        });
    }
    return this._promise;
  }

  then<TResult1 = Returned, TResult2 = never>(
    onFullfilled?: ((value: Returned) => TResult1 | PromiseLike<TResult1>) | null | undefined,
    onRejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null | undefined,
  ) {
    return this.toPromise().then(onFullfilled, onRejected);
  }

  catch<TResult = never>(
    onRejected?: ((reason: any) => TResult | PromiseLike<TResult>) | null | undefined,
  ) {
    return this.toPromise().catch(onRejected);
  }

  finally(onFinally?: (() => void) | null | undefined) {
    return this.toPromise().finally(onFinally);
  }

  static pipeline<P extends (null | undefined | RedisPromise)[]>(
    promises: [...P],
  ): RedisPromise<InferCmdResponses<P>> {
    const first = promises[0];

    if (!first) return [] as any;

    const adapter = first.adapter;
    const commands: RedisArg[][] = [];

    for (const p of promises) {
      if (!p) {
        commands.push([]);
      } else {
        commands.push(p.commands[0]);
      }
    }

    const transform = (value: any) => {
      const responses: any[] = [];
      let i = 0;
      for (const p of promises) {
        if (!p) {
          responses.push(value[i]);
          i++;
        } else {
          responses.push(p.transform(value[i]));
          i++;
        }
      }
      return responses;
    };

    const p = new RedisPromise(adapter, commands, transform);

    return p as any;
  }

  static multi<P extends (null | undefined | RedisPromise)[]>(
    promises: [...P],
  ): RedisPromise<InferCmdResponses<P>> {
    const p = RedisPromise.pipeline(promises);
    p.wantsMulti = true;
    return p;
  }
}

export const pipeline = RedisPromise.pipeline;
export const multi = RedisPromise.multi;
