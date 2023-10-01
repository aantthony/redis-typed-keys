export interface RedisErrorReply {
  error: string;
}

export type RedisReply =
  | RedisErrorReply
  | string
  | number
  | Buffer
  | null
  | undefined
  | Array<RedisReply>;

export type RedisArg = string | Buffer;

export interface RedisAdapter {
  send(
    commands: RedisArg[][],
    opts: {
      multi?: boolean;
    },
  ): Promise<RedisReply[]>;
}
