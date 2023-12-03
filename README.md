# redis-typed-keys

<a href="https://www.npmjs.com/package/redis-typed-keys"><img src="https://img.shields.io/npm/v/redis-typed-keys.svg?style=flat" /></a>

Typed Redis.

The purpose of this library is to have correct Typescript types when using Redis.

It's not a full ORM, it intends to be a minimal wrapper around the Redis API, with correct types.

It doesn't do automatic JSON deserialization that's common in other libraries. In `tredis` you create an object which references a specific key, which is typed.

Simple example:

```ts
import { Schema, createVercelKvAdapter } from 'redis-typed-keys';
import { createVercelKvAdapter } from 'redis-typed-keys/vercel-kv';
const t = new Schema(createVercelKvAdapter());

// use a string key called 'myCounter'
const myCounter = t.string('myCounter');

const nextValue = await myCounter.incr(); // nextValue is a number

const nextValue = await myCounter.op<number>('INCR', []); // same as above
```

## Detailed Usage:

```ts
import {
  Schema,
  multi,
  pipeline,
} from 'redis-typed-keys';
import { createVercelKvAdapter } from 'redis-typed-keys/vercel-kv';

const t = new Schema(
  async () => createVercelKvAdapter({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  }),
);

interface StoredUser {
  name: string;
  email: string;
  age: string; // all fields are strings
  [key: string]: string; // other fields
}

export const rdb = {
  user(uid: string) {
    return t.hash<StoredUser>(`user:${uid}`);
  },
  example: t.string('example_key'),
  counter: t.int('example:counter'),
  usersByEmail: t.hash('usersByEmail'),
  mylist: t.list('mylist'),
  eventlog: t.stream('eventlog'),
};

async function main() {
  const next = await rdb.counter.incr();

  // multi:
  const [userRes, counterRes] = multi([
    rdb.user('123').set({ name: 'John' }),
    rdb.counter.incr(),
  ]);

  console.log(`Counter is now ${counterRes}`);
}
```

## Supported types

- t.hash
- t.list
- t.script
- t.set
- t.sorted
- t.stream
- t.string
- t.int - alias for t.string
- t.path('prefix').hash - All keys will be prefixed with the given prefix. This is useful for namespacing.

All of the methods are correctly typed, and will return the correct type for the given command.

Many of the commands haven't been added yet. For those, either create a pull request, or use the `key.op('command', ...args)` syntax.

## Supported connections:

```ts
import { createVercelKvAdapter } from 'redis-typed-keys/vercel-kv';
import { createUpstashAdapter } from 'redis-typed-keys/upstash';
import { createNodeRedisAdapter } from 'redis-typed-keys/node-redis';
import { createNodeRedisClusterAdapter } from 'redis-typed-keys/node-redis-cluster';

// Usage:
createNodeRedisAdapter({ client: createClient(...), ErrorReply });
createNodeRedisClusterAdapter({ cluster: createCluster({...}), ErrorReply });
createVercelKvAdapter({ url, token }); // optional, defaults to process.env.KV_REST_API_URL and KV_REST_API_TOKEN
createUpstashAdapter({ url, token }); // optional, defaults to process.env.UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
```
