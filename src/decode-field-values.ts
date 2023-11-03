import type { AllStrings } from './common-types';

export function decodeFieldValues<T extends AllStrings<T>>(pairs: string[]): T {
  const obj: Record<string, string> = {};

  for (let i = 0; i < pairs.length; i += 2) {
    obj[pairs[i]] = pairs[i + 1];
  }

  return obj as T;
}
