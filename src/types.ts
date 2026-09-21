export type KeysToObject<O extends object, Keys extends readonly (keyof O)[]> = {
  [K in Keys[number]]: K extends keyof O ? O[K] : never;
};

/**
 * Use context to keep track of changes in object and arrays
 */
export type Context = {
  version: number,
}
