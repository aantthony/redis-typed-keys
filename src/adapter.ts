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
  | RedisReply[];

export type RedisArg = string | Buffer;

export interface Cmd {
  firstKey: string;
  args: RedisArg[];
}

export interface RedisAdapter {
  send: (
    commands: Cmd[],
    opts: {
      multi?: boolean;
    },
  ) => Promise<RedisReply[]>;
}
