# tredis

Typed Redis.

The purpose of this library is to have correct Typescript types when using Redis.

It's not a full ORM, it intends to be a minimal wrapper around the Redis API, with correct types.

It doesn't do automatic JSON deserialization that's common in other libraries. In `tredis` you create an object which references a specific key, which is typed.

Simple example:

```ts
import { Schema, createVercelKvAdapter } from 'tredis';
const t = new Schema(createVercelKvAdapter());

// use a string key called 'myCounter'
const myCounter = t.string('myCounter');

const nextValue = await myCounter.incr(); // nextValue is a number

const nextValue = await myCounter.op<number>('INCR', []); // same as above
```

## Detailed Usage:

```ts
import { Schema, createVercelKvAdapter, multi, pipeline } from 'tredis';

const t = new Schema(createVercelKvAdapter());

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

- Vercel KV: `createVercelKvAdapter`
- Upstash: `createUpstashAdapter`
- node-redis: `createNodeRedisAdapter({ client: redisClient, ErrorReply })` (ErrorReply is needed for correct error handling)
