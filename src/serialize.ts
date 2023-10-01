export type RedisValue = string | number | boolean;

export function serialize(c: RedisValue) {
  if (typeof c === 'string') {
    return c;
  }
  if (typeof c === 'number') {
    return c.toString();
  }
  if (typeof c === 'boolean') {
    return c ? '1' : '0';
  }
  throw new Error('unreachable');
}
