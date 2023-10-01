export type AllStrings<T> = {
  [K in keyof T]: T[K] extends string | undefined ? string : never;
};
